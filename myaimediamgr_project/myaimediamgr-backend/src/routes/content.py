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
    import google.generativeai as genai
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

def generate_caption_for_image(image_bytes, theme, platforms):
    """Generates a caption for a given image using a multimodal model, tailored to platform constraints."""
    model = GenerativeModel("gemini-2.5-flash")
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
    # Engineer a detailed prompt from the structured brief
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
    
    credentials, _ = google.auth.default()
    credentials.refresh(google.auth.transport.requests.Request())
    
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
        method="GET",
        service_account_email=credentials.service_account_email,
        access_token=credentials.token,
    )
    return signed_url, image_bytes

def generate_video_content(prompt):
    # This is a placeholder for the future migration to the new SDK
    raise NotImplementedError("Video generation is not yet fully migrated.")

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
            text_content = generate_caption_for_image(image_bytes, brief.get('captionTheme'), platforms)
        elif content_type == 'video':
            # For now, video generation is not fully implemented with the new brief
            media_url = generate_video_content(brief.get('mainSubject'))
            media_type = 'video'
            text_content = f"An AI-generated video based on the theme: {brief.get('captionTheme')}"
        
        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in content generation: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

# ... (manual_post_route and get_pending_posts remain the same for now)