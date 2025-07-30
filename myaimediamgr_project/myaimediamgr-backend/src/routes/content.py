from flask import Blueprint, request, jsonify
import os
import time
from datetime import datetime
from google.cloud import firestore, storage
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
genai.configure(project=PROJECT_ID)

# --- Helper Functions ---
def get_user_or_404(uid):
    user = User.query.get(uid)
    if not user:
        raise Exception("User not found")
    return user

def check_and_decrement_quota(user, content_type):
    quota_map = {
        'image': 'image_quota',
        'video': 'video_v2_quota', # Assuming Veo maps to v2 quota
        'text': 'image_quota'
    }
    quota_attr = quota_map.get(content_type)
    if not quota_attr:
        raise Exception("Invalid content type for quota check")

    current_val = getattr(user, quota_attr)
    if current_val <= 0:
        raise Exception(f"No {content_type} credits remaining.")
    
    setattr(user, quota_attr, current_val - 1)
    return True

# --- AI Model Generation Functions ---

def generate_text_content(prompt):
    """Generates text content using Gemini 1.5 Flash."""
    model = GenerativeModel("gemini-1.5-flash-001")
    full_prompt = f"As a professional social media manager, create an engaging and concise caption for the following theme: '{prompt}'. The caption should include 2-3 relevant hashtags and be ready to publish."
    response = model.generate_content(full_prompt)
    return response.text

def generate_image_content(prompt):
    """Generates an image using Imagen, uploads to GCS, and returns a public URL."""
    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    images = model.generate_images(prompt=prompt, number_of_images=1)
    
    file_name = f"generated-media/image-{int(time.time())}.png"
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(file_name)
    
    from io import BytesIO
    image_bytes = BytesIO()
    images[0].save(image_bytes, format='PNG')
    image_bytes.seek(0)
    
    blob.upload_from_file(image_bytes, content_type='image/png')
    blob.make_public()
    return blob.public_url

def generate_video_content(prompt):
    """Generates a short video using Veo Fast, polls for completion, and returns a public URL."""
    output_gcs_uri = f"gs://{BUCKET_NAME}/generated-media/"
    
    operation = genai.generate_videos(
        model="models/veo-3-fast-generate-001", # Using the fast model for shorter clips
        prompt=prompt,
        output_gcs_uri=output_gcs_uri
    )

    print(f"Started video generation operation: {operation.operation.name}")
    
    # Poll for completion
    while not operation.done:
        time.sleep(10) # Poll every 10 seconds
        operation = genai.get_operation(operation.operation.name)
        print(f"Polling video generation status: {operation.metadata.state.name}")

    if operation.error:
        raise Exception(f"Video generation failed: {operation.error.message}")

    video_uri = operation.result.generated_videos[0].video.uri
    
    if video_uri.startswith(f'gs://{BUCKET_NAME}/'):
        blob_name = video_uri.replace(f'gs://{BUCKET_NAME}/', '')
        blob = storage_client.bucket(BUCKET_NAME).blob(blob_name)
        if blob.exists():
            blob.make_public()
            return blob.public_url
        else:
            raise Exception("Generated video file not found in GCS.")
    else:
        raise Exception(f"Unexpected video URI format: {video_uri}")


# --- API Endpoints ---

@content_bp.route('/api/content/generate', methods=['POST'])
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

        text_content = ""
        media_url = None
        media_type = None

        if generate_text or content_type == 'text':
            text_content = generate_text_content(theme)

        if content_type == 'image':
            media_url = generate_image_content(theme)
            media_type = 'image'
        elif content_type == 'video':
            media_url = generate_video_content(theme)
            media_type = 'video'
        
        db.session.commit()

        response_data = {
            'text': text_content,
            'media_url': media_url,
            'media_type': media_type
        }
        
        return jsonify({'success': True, 'data': response_data})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in content generation: {e}")
        return jsonify({'success': False, 'error': f'Failed to generate content: {str(e)}'}), 500

@content_bp.route('/api/content/manual_post', methods=['POST'])
def manual_post_route():
    try:
        uid = request.form.get('uid')
        text_content = request.form.get('text')
        post_now = request.form.get('postNow', 'false').lower() == 'true'
        
        if not all([uid, text_content, 'file' in request.files]):
            return jsonify({'success': False, 'error': 'Missing required fields: uid, text, file'}), 400

        user = get_user_or_404(uid)
        check_and_decrement_quota(user, 'image') # Assume manual post uses an image credit

        media_file = request.files['file']
        file_name = f"manual-uploads/{uid}/{int(time.time())}-{media_file.filename}"
        
        blob = storage_client.bucket(BUCKET_NAME).blob(file_name)
        blob.upload_from_file(media_file, content_type=media_file.content_type)
        blob.make_public()
        media_url = blob.public_url
        
        # Create post object in Firestore
        post_data = {
            'uid': uid,
            'text': text_content,
            'media_url': media_url,
            'media_type': 'image' if 'image' in media_file.content_type else 'video',
            'status': 'posted' if post_now else 'pending',
            'createdAt': datetime.utcnow(),
            'source': 'manual'
        }
        
        firestore_db.collection('posts').add(post_data)
        db.session.commit()
        
        return jsonify({'success': True, 'message': f"Post successfully {'published' if post_now else 'added to queue'}."})

    except Exception as e:
        db.session.rollback()
        print(f"Error in manual post: {e}")
        return jsonify({'success': False, 'error': f'Failed to create manual post: {str(e)}'}), 500

