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
from vertexai.preview.generative_models import GenerativeModel, Image
from vertexai.preview.vision_models import ImageGenerationModel
import logging
from google.api_core import exceptions
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

content_bp = Blueprint('content', __name__)

# --- Environment Setup ---
PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
LOCATION = "us-central1"
BUCKET_NAME = "final-myaimediamgr-website-media"

# --- Correct, Unified Initialization ---
vertexai.init(project=PROJECT_ID, location=LOCATION)
storage_client = storage.Client()
firestore_db = firestore.Client(project=PROJECT_ID)

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
        if not gcs_uri.startswith("gs://"):
            logging.error(f"Invalid GCS URI provided for signing: {gcs_uri}")
            return gcs_uri

        bucket_name, blob_name = gcs_uri.replace("gs://", "").split("/", 1)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
            method="GET"
        )
        return signed_url
    except Exception as e:
        logging.error(f"Failed to generate signed URL for {gcs_uri}: {e}", exc_info=True)
        return gcs_uri

# --- AI Model Generation Functions ---

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=5, max=30),
    retry=retry_if_exception_type(exceptions.ResourceExhausted)
)
def generate_caption_for_image(image_bytes, theme, platforms):
    """Generates a caption for a given image using a multimodal model."""
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
        strictest_limit = 280
        platform_details_string = "general social media"
    else:
        strictest_limit = min(p['limit'] for p in selected_platforms_details)
        platform_details_string = ", ".join([f"{p['name']} ({p['limit']} characters)" for p in selected_platforms_details])

    prompt = [
        f"You are an expert social media manager. Analyze this image and the user's original theme. Write an engaging and concise caption for a social media post.",
        f"The caption will be used on the following platforms: {platform_details_string}.",
        f"CRUCIALLY, the entire caption must be no more than {strictest_limit} characters long.",
        "The caption must be relevant to both the image and the theme. Include 2-3 relevant hashtags.",
        f"User's Theme: {theme}",
        image
    ]
    
    response = model.generate_content(prompt)
    return response.text

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=5, max=30),
    retry=retry_if_exception_type(exceptions.ResourceExhausted)
)
def generate_image_content(brief):
    """Generates an image and returns the signed URL and the image bytes."""
    prompt_parts = [
        brief.get('mainSubject'), brief.get('setting'), brief.get('style'), brief.get('details')
    ]
    engineered_prompt = ", ".join(filter(None, prompt_parts))

    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    images = model.generate_images(prompt=engineered_prompt, number_of_images=1)
    
    image_bytes = images[0]._image_bytes
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    
    gcs_uri = f"gs://{BUCKET_NAME}/{file_name}"
    signed_url = generate_signed_url_for_gcs_uri(gcs_uri)
    
    return signed_url, image_bytes

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=5, max=30),
    retry=retry_if_exception_type(exceptions.ResourceExhausted)
)
def generate_video_content(brief):
    """Generates a video using Veo on Vertex AI and returns the signed URL."""
    prompt_parts = [
        brief.get('mainSubject'), brief.get('setting'), brief.get('style'), brief.get('details')
    ]
    engineered_prompt = ", ".join(filter(None, prompt_parts))
    
    logging.info(f"Starting video generation for prompt: '{engineered_prompt}'")

    model = GenerativeModel("veo-2.0-generate-001")

    response = model.generate_content(
        [engineered_prompt],
        generation_config={
            "max_output_tokens": 2048,
            "temperature": 0.4,
            "top_p": 1,
            "top_k": 32
        },
        stream=False,
    )
    
    if not response.parts:
        raise Exception("Video generation failed to produce a valid response part.")

    video_part = response.parts[0]
    if not hasattr(video_part, 'file_data') or not video_part.file_data.file_uri:
        raise Exception(f"Unexpected response format from video generation: {response}")

    gcs_uri = video_part.file_data.file_uri
    logging.info(f"Video generation successful. Output at: {gcs_uri}")
    
    signed_url = generate_signed_url_for_gcs_uri(gcs_uri)
    return signed_url

# --- API Endpoints ---

@content_bp.route('/content/generate', methods=['POST'])
def generate_content_route():
    try:
        data = request.get_json()
        brief = data.get('brief')
        uid = data.get('uid')
        content_type = data.get('contentType')
        platforms = data.get('platforms')
        
        if not all([brief, uid, content_type, platforms]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, content_type)

        text_content, media_url, media_type = "", None, None

        if content_type == 'image':
            media_url, image_bytes = generate_image_content(brief)
            media_type = 'image'
            text_content = generate_caption_for_image(image_bytes, brief.get('captionTheme'), platforms)
        
        elif content_type == 'video':
            media_url = generate_video_content(brief)
            media_type = 'video'
            text_content = f"An AI-generated video based on the theme: {brief.get('captionTheme')}"

        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in content generation: {e}", exc_info=True)
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