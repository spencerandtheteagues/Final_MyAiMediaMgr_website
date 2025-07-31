from flask import Blueprint, request, jsonify
import os
import time
from datetime import datetime, timedelta, timezone
from google.cloud import firestore, storage
import google.auth
import google.auth.transport.requests
from src.models.user import User
from src.database import db
import vertexai
from vertexai.generative_models import GenerativeModel, Image
from vertexai.preview.vision_models import ImageGenerationModel
import logging
# Correct SDK for advanced models like Veo
import google.genai as genai
from google.genai.types import GenerateVideosConfig
from google.api_core import exceptions

content_bp = Blueprint('content', __name__)

# --- Environment Setup ---
PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
LOCATION = "us-central1"
BUCKET_NAME = "final-myaimediamgr-website-media"

# --- Correct Initialization ---
vertexai.init(project=PROJECT_ID, location=LOCATION)
storage_client = storage.Client()
firestore_db = firestore.Client(project=PROJECT_ID)

# Initialize the google-genai client for Vertex AI.
# This uses Application Default Credentials (ADC) and the project/location
# set in the environment or detected by the library.
try:
    genai_client = genai.Client()
except Exception as e:
    logging.error(f"Failed to initialize google.genai.Client: {e}", exc_info=True)
    genai_client = None

# --- Helper Functions ---
def get_user_or_404(uid):
    user = User.query.get(uid)
    if not user:
        raise Exception("User not found")
    return user

def check_and_decrement_quota(user, content_type):
    if user.role == 'admin':
        return True
    quota_map = {
        'image': 'image_quota', 'video': 'video_v2_quota', 'text': 'text_quota'
    }
    quota_attr = quota_map.get(content_type)
    if not quota_attr:
        raise Exception("Invalid content type for quota check")
    with db.session.begin_nested():
        user_to_update = db.session.query(User).filter_by(id=user.id).with_for_update().one()
        current_val = getattr(user_to_update, quota_attr)
        if current_val is None or current_val <= 0:
            raise Exception(f"No {content_type} credits remaining.")
        setattr(user_to_update, quota_attr, current_val - 1)
    return True

def generate_signed_url_for_gcs_uri(gcs_uri):
    """Generates a temporary, publicly accessible URL for a GCS object."""
    try:
        bucket_name = gcs_uri.split('/')[2]
        blob_name = '/'.join(gcs_uri.split('/')[3:])
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        credentials, _ = google.auth.default()
        if credentials.token is None:
            credentials.refresh(google.auth.transport.requests.Request())
        
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
            method="GET",
            service_account_email=credentials.service_account_email,
            access_token=credentials.token,
        )
        return signed_url
    except Exception as e:
        logging.error(f"Failed to generate signed URL for {gcs_uri}: {e}", exc_info=True)
        # Return the original GCS URI as a fallback
        return gcs_uri

# --- AI Model Generation Functions ---

def generate_caption_for_image(image_bytes, theme, platforms):
    """Generates a caption for a given image using a multimodal model, tailored to platform constraints."""
    model = GenerativeModel("gemini-1.5-flash")
    image = Image.from_bytes(image_bytes)
    
    platform_map = {
        'twitter': {'name': 'X', 'limit': 280},
        'instagram': {'name': 'Instagram', 'limit': 2200},
        'linkedin': {'name': 'LinkedIn', 'limit': 3000},
        'facebook': {'name': 'Facebook', 'limit': 63206},
        'tiktok': {'name': 'TikTok', 'limit': 2200},
        'youtube': {'name': 'YouTube', 'limit': 10000}
    }

    selected_platforms_details = [p for p in [platform_map.get(p_id) for p_id in platforms] if p]
    
    if not selected_platforms_details:
        strictest_limit = 280 # Default fallback
        platform_details_string = "general social media"
    else:
        strictest_limit = min(p['limit'] for p in selected_platforms_details)
        platform_details_string = ", ".join([f"{p['name']} ({p['limit']} characters)" for p in selected_platforms_details])

    prompt = [
        f"You are an expert social media manager. Analyze this image and the user's original theme. Write an engaging and concise caption for a social media post.",
        f"The caption will be used on the following platforms: {platform_details_string}.",
        f"CRUCIALLY, the entire caption must be no more than {strictest_limit} characters long to be compatible with all selected platforms.",
        "The caption must be relevant to both the image and the theme. Include 2-3 relevant hashtags.",
        f"User's Theme: {theme}",
        image
    ]
    
    response = model.generate_content(prompt)
    return response.text

def generate_image_content(brief):
    """Generates an image and returns the signed URL and the image bytes."""
    prompt_parts = [
        brief.get('mainSubject'),
        brief.get('setting'),
        brief.get('style'),
        brief.get('details')
    ]
    engineered_prompt = ", ".join(filter(None, prompt_parts))

    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    images = model.generate_images(
        prompt=engineered_prompt,
        number_of_images=1,
    )
    
    image_bytes = images[0]._image_bytes
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    
    gcs_uri = f"gs://{BUCKET_NAME}/{file_name}"
    signed_url = generate_signed_url_for_gcs_uri(gcs_uri)
    
    return signed_url, image_bytes

def generate_video_content(brief):
    """Generates a video using Veo on Vertex AI and returns the signed URL."""
    if not genai_client:
        raise Exception("Video generation client is not initialized. Check logs for errors.")

    # Engineer a detailed prompt from the structured brief
    prompt_parts = [
        brief.get('mainSubject'),
        brief.get('setting'),
        brief.get('style'),
        brief.get('details')
    ]
    engineered_prompt = ", ".join(filter(None, prompt_parts))
    
    output_gcs_uri = f"gs://{BUCKET_NAME}/video-outputs/{int(time.time())}/"
    model_name = "veo-1.0.0-generate-001" # Using a stable Veo model identifier

    logging.info(f"Starting video generation for prompt: '{engineered_prompt}'")

    # Initiate the Long-Running Operation (LRO)
    operation = genai_client.models.generate_videos(
        model=model_name,
        prompt=engineered_prompt,
        config=GenerateVideosConfig(
            output_gcs_uri=output_gcs_uri,
            aspect_ratio="16:9",
            duration=6,
            person_generation="allow_adult"
        ),
    )

    logging.info(f"Video generation operation started: {operation.operation.name}")
    
    # Poll for completion - in a real-world scenario, this should be a background task
    # For a standard HTTP request, we poll for a reasonable amount of time.
    # A more robust solution would use Cloud Tasks or Pub/Sub to handle the LRO result.
    polling_deadline = time.time() + 300 # 5-minute deadline for polling
    while not operation.done and time.time() < polling_deadline:
        time.sleep(20) # Wait between checks
        try:
            # The operation object must be refreshed to get the latest status
            operation = genai_client.operations.get(operation)
            if operation.metadata:
                logging.info(f"Video generation progress: {operation.metadata.progress_percent}%")
        except exceptions.GoogleAPICallError as e:
            logging.error(f"Error while polling for video status: {e}", exc_info=True)
            # Decide if the error is retryable or fatal
            if e.code in [503, 504]: # Service Unavailable, Gateway Timeout
                continue # Retry polling
            else:
                raise Exception(f"API error during polling: {e.message}")

    if not operation.done:
        logging.warning("Video generation timed out from the server's perspective.")
        # Here you could return a pending status to the client
        raise Exception("Video generation is taking longer than expected. Please check the queue later.")

    if operation.error:
        logging.error(f"Video generation LRO failed with error: {operation.error.message}")
        raise Exception(f"Failed to generate video: {operation.error.message}")

    if operation.response:
        video_gcs_uri = operation.result.generated_videos.video.uri
        logging.info(f"Video generation successful. Output at: {video_gcs_uri}")
        signed_url = generate_signed_url_for_gcs_uri(video_gcs_uri)
        return signed_url
    else:
        raise Exception("Operation finished but no video was generated.")


# --- API Endpoints ---

@content_bp.route('/content/generate', methods=['POST'])
def generate_content_route():
    try:
        data = request.get_json()
        brief = data.get('brief')
        uid = data.get('uid')
        content_type = data.get('contentType')
        platforms = data.get('platforms')
        
        if not brief or not uid or not content_type or not platforms:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, content_type)

        text_content, media_url, media_type = "", None, None

        if content_type == 'image':
            media_url, image_bytes = generate_image_content(brief)
            media_type = 'image'
            # Use the 'captionTheme' from the brief for generating the caption
            text_content = generate_caption_for_image(image_bytes, brief.get('captionTheme'), platforms)
        
        elif content_type == 'video':
            media_url = generate_video_content(brief)
            media_type = 'video'
            # Generate a simple placeholder caption for the video for now
            text_content = f"An AI-generated video based on the theme: {brief.get('captionTheme')}"

        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in content generation: {e}", exc_info=True)
        # Provide a more specific error message if it's a known exception type
        if isinstance(e, exceptions.GoogleAPICallError):
            return jsonify({'success': False, 'error': f'Cloud API Error: {e.message}'}), 500
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

@content_bp.route('/content/manual', methods=['POST'])
def manual_post_route():
    try:
        data = request.get_json()
        uid = data.get('uid')
        text = data.get('text')
        media_url = data.get('media_url')
        media_type = data.get('media_type')
        platforms = data.get('platforms')

        if not all([uid, text, media_url, media_type, platforms]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400

        user = get_user_or_404(uid)

        post_ref = firestore_db.collection('pending_posts').document()
        post_ref.set({
            'user_id': user.id,
            'text': text,
            'media_url': media_url,
            'media_type': media_type,
            'platforms': platforms,
            'status': 'pending',
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'success': True, 'message': 'Content sent to approval queue.'})
    except Exception as e:
        logging.error(f"Error in manual post submission: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Failed to submit content: {str(e)}'}), 500

@content_bp.route('/content/pending', methods=['GET'])
def get_pending_posts():
    try:
        posts_ref = firestore_db.collection('pending_posts').where('status', '==', 'pending').order_by('created_at').stream()
        posts = []
        for post in posts_ref:
            post_data = post.to_dict()
            post_data['id'] = post.id
            posts.append(post_data)
        return jsonify({'success': True, 'data': posts})
    except Exception as e:
        logging.error(f"Error fetching pending posts: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Failed to fetch pending posts: {str(e)}'}), 500
