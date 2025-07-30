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
from vertexai.generative_models import GenerativeModel
from vertexai.vision_models import ImageGenerationModel
import google.generativeai as genai

content_bp = Blueprint('content', __name__)

# --- Environment Setup ---
PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
LOCATION = "us-central1"
BUCKET_NAME = "final-myaimediamgr-website-media"

# Initialize clients
vertexai.init(project=PROJECT_ID, location=LOCATION)
firestore_db = firestore.Client(project=PROJECT_ID)
storage_client = storage.Client(project=PROJECT_ID)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
    model = GenerativeModel("gemini-2.5-flash")
    full_prompt = f"As a professional social media manager, create an engaging and concise caption for the following theme: '{prompt}'. The caption should include 2-3 relevant hashtags and be ready to publish."
    response = model.generate_content(full_prompt)
    return response.text

def generate_image_content(prompt):
    model = ImageGenerationModel.from_pretrained("imagen-4-0-text-to-image")
    images = model.generate_images(prompt=prompt, number_of_images=1)
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    
    image_bytes = images[0]._image_bytes
    blob.upload_from_string(image_bytes, content_type='image/png')
    
    credentials, project_id = google.auth.default()
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
    output_gcs_uri = f"gs://{BUCKET_NAME}/generated-media/"
    operation = genai.generate_videos(
        model="veo-001", prompt=prompt, output_gcs_uri=output_gcs_uri
    )
    operation.result()

    if operation.error:
        raise Exception(f"Video generation failed: {operation.error.message}")

    video_uri = operation.result.generated_videos[0].video.uri
    if video_uri.startswith(f'gs://{BUCKET_NAME}/'):
        blob_name = video_uri.replace(f'gs://{BUCKET_NAME}/', '')
        blob = storage_client.bucket(BUCKET_NAME).blob(blob_name)
        if blob.exists():
            credentials, project_id = google.auth.default()
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
        generate_text = data.get('generateText', True)

        if not theme or not uid:
            return jsonify({'success': False, 'error': 'Theme and uid are required'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, content_type)

        text_content, media_url, media_type = "", None, None

        if generate_text or content_type == 'text':
            text_content = generate_text_content(theme)
        if content_type == 'image':
            media_url, media_type = generate_image_content(theme), 'image'
        elif content_type == 'video':
            media_url, media_type = generate_video_content(theme), 'video'
        
        db.session.commit()
        return jsonify({'success': True, 'data': {'text': text_content, 'media_url': media_url, 'media_type': media_type}})
    except Exception as e:
        db.session.rollback()
        print(f"Error in content generation: {e}")
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

@content_bp.route('/content/manual_post', methods=['POST'])
def manual_post_route():
    try:
        uid = request.form.get('uid')
        text_content = request.form.get('text')
        post_now = request.form.get('postNow', 'false').lower() == 'true'
        
        if not all([uid, text_content, 'file' in request.files]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, 'image')

        media_file = request.files['file']
        file_name = f"manual-uploads/{uid}/{int(time.time())}-{media_file.filename}"
        
        blob = storage_client.bucket(BUCKET_NAME).blob(file_name)
        blob.upload_from_file(media_file, content_type=media_file.content_type)
        
        credentials, project_id = google.auth.default()
        credentials.refresh(google.auth.transport.requests.Request())
        
        media_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
            method="GET",
            service_account_email=credentials.service_account_email,
            access_token=credentials.token,
        )
        
        post_data = {
            'uid': uid, 'text': text_content, 'media_url': media_url,
            'media_type': 'image' if 'image' in media_file.content_type else 'video',
            'status': 'posted' if post_now else 'pending',
            'createdAt': datetime.utcnow(), 'source': 'manual'
        }
        
        firestore_db.collection('posts').add(post_data)
        db.session.commit()
        
        return jsonify({'success': True, 'message': f"Post successfully {'published' if post_now else 'added to queue'}."})
    except Exception as e:
        db.session.rollback()
        print(f"Error in manual post: {e}")
        return jsonify({'success': False, 'error': f'Failed to create manual post: {str(e)}'}), 500

@content_bp.route('/content/pending', methods=['GET'])
def get_pending_posts():
    try:
        posts_ref = firestore_db.collection('posts')
        pending_posts_query = posts_ref.where('status', '==', 'pending').order_by('createdAt', direction=firestore.Query.DESCENDING)
        
        results = []
        for doc in pending_posts_query.stream():
            post_data = doc.to_dict()
            post_data['id'] = doc.id
            if 'createdAt' in post_data and isinstance(post_data['createdAt'], datetime):
                post_data['createdAt'] = post_data['createdAt'].isoformat()
            results.append(post_data)
            
        return jsonify({'success': True, 'data': results})
    except Exception as e:
        print(f"Error fetching pending posts: {e}")
        return jsonify({'success': False, 'error': f'Failed to fetch pending posts: {str(e)}'}), 500