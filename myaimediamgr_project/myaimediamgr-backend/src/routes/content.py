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
from vertexai.preview.vision_models import ImageGenerationModel, Image
import google.generativeai as genai
import logging

content_bp = Blueprint('content', __name__)

# --- Environment Setup ---
PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
LOCATION = "us-central1"
BUCKET_NAME = "final-myaimediamgr-website-media"

# --- Correct Initialization ---
vertexai.init(project=PROJECT_ID, location=LOCATION)
storage_client = storage.Client()
firestore_db = firestore.Client(project=PROJECT_ID)

if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
else:
    logging.warning("GEMINI_API_KEY not found. Video generation will be disabled.")
    genai = None

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

# --- AI Model Generation Functions ---

def generate_text_content(prompt):
    # This function is a placeholder as text is generated with the media
    return f"A generated caption for the theme: {prompt}"

def generate_image_content(prompt):
    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    images = model.generate_images(
        prompt=prompt,
        number_of_images=1,
    )
    
    image_bytes = images[0]._image_bytes
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    
    credentials, _ = google.auth.default()
    credentials.refresh(google.auth.transport.requests.Request())
    
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
        method="GET",
        service_account_email=credentials.service_account_email,
        access_token=credentials.token,
    )
    return signed_url

def generate_video_content(prompt):
    if not genai:
        raise Exception("Video generation is disabled due to missing GEMINI_API_KEY.")
        
    output_gcs_uri = f"gs://{BUCKET_NAME}/generated-media/"
    operation = genai.generate_videos(
        model="veo-001", prompt=prompt, output_gcs_uri=output_gcs_uri
    )
    logging.info("Waiting for video generation operation to complete...")
    operation.result()

    if operation.error:
        raise Exception(f"Video generation failed: {operation.error.message}")

    video_uri = operation.result.generated_videos[0].video.uri
    if video_uri.startswith(f'gs://{BUCKET_NAME}/'):
        blob_name = video_uri.replace(f'gs://{BUCKET_NAME}/', '')
        blob = storage_client.bucket(BUCKET_NAME).blob(blob_name)
        if blob.exists():
            credentials, _ = google.auth.default()
            credentials.refresh(google.auth.transport.requests.Request())
            
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
                method="GET",
                service_account_email=credentials.service_account_email,
                access_token=credentials.token,
            )
            return signed_url
        else:
            raise Exception("Generated video file not found in GCS.")
    else:
        raise Exception(f"Unexpected video URI format: {video_uri}")

# --- API Endpoints ---

@content_bp.route('/content/generate', methods=['POST'])
def generate_content_route():
    try:
        data = request.get_json()
        theme = data.get('theme')
        uid = data.get('uid')
        content_type = data.get('contentType', 'text')
        
        if not theme or not uid:
            return jsonify({'success': False, 'error': 'Theme and uid are required'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, content_type)

        text_content, media_url, media_type = "", None, None

        if content_type == 'image':
            media_url = generate_image_content(theme)
            media_type = 'image'
            text_content = f"An AI-generated image based on the theme: {theme}"
        elif content_type == 'video':
            media_url = generate_video_content(theme)
            media_type = 'video'
            text_content = f"An AI-generated video based on the theme: {theme}"
        else:
            text_content = generate_text_content(theme)
        
        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in content generation: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

# ... (manual_post_route and get_pending_posts remain the same for now)
