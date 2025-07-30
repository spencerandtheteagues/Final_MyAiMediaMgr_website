from flask import Blueprint, request, jsonify
import os
import time
from datetime import datetime, timedelta, timezone
from google.cloud import firestore, storage
from google.oauth2 import service_account
from google.cloud import aiplatform
from google.api_core import exceptions
import base64
from src.models.user import User
from src.database import db
import logging

content_bp = Blueprint('content', __name__)

# --- Environment Setup ---
PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
LOCATION = "us-central1"
BUCKET_NAME = "final-myaimediamgr-website-media"
SERVICE_ACCOUNT_KEY_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# --- Production-Ready Authentication & Initialization ---
try:
    if SERVICE_ACCOUNT_KEY_PATH:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_KEY_PATH,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
    else:
        # Fallback to Application Default Credentials for local dev or if key path is not set
        credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/cloud-platform'])

    aiplatform.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
    storage_client = storage.Client(credentials=credentials)
    firestore_db = firestore.Client(project=PROJECT_ID, credentials=credentials)

except Exception as e:
    logging.error(f"FATAL: Failed to initialize Google Cloud clients: {e}", exc_info=True)
    # In a real app, you might want to handle this more gracefully
    # For now, we'll let it raise to prevent the app from starting in a broken state
    raise

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
    # This function is now a placeholder as text is generated with the media
    return ""

def generate_image_content(prompt):
    model = aiplatform.ImageGenerationModel.from_pretrained("imagegeneration@006")
    response = model.generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio="1:1",
        add_watermark=False,
        seed=42
    )
    
    image_bytes = response.images[0]._image_bytes
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_bytes, content_type='image/png')
    
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
        method="GET",
    )
    return signed_url

def generate_video_content(prompt):
    # Note: As of late 2025, the Veo models are not yet available in the aiplatform SDK
    # This is a placeholder for the future migration
    raise NotImplementedError("Video generation is not yet implemented with the new SDK.")

# --- API Endpoints ---

@content_bp.route('/content/generate', methods=['POST'])
def generate_content_route():
    try:
        data = request.get_json()
        theme = data.get('theme')
        uid = data.get('uid')
        content_type = data.get('contentType', 'text')
        generate_text = data.get('generateText', True)

        if not theme or not uid:
            return jsonify({'success': False, 'error': 'Theme and uid are required'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, content_type)

        text_content, media_url, media_type = "", None, None

        if content_type == 'image':
            media_url = generate_image_content(theme)
            media_type = 'image'
            # For now, we'll generate a simple caption as text is not returned from the image model
            text_content = f"A beautiful image about: {theme}"
        elif content_type == 'video':
            media_url = generate_video_content(theme)
            media_type = 'video'
            text_content = f"A stunning video about: {theme}"
        else: # text only
            text_content = generate_text_content(theme)

        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in content generation: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

# ... (manual_post_route and get_pending_posts remain the same for now)
