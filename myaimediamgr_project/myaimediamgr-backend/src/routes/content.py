from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime
from google.cloud import secretmanager
from src.models.user import User
from src.database import db
import vertexai
from vertexai.preview.generative_models import GenerativeModel, Part
import vertexai.preview.vision_models as vision_models

# Function to access a secret from Google Secret Manager
def access_secret_version(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

# --- AI Model Generation Functions ---

def generate_text_content(prompt):
    """Generates text content using Gemini 1.0 Pro."""
    model = GenerativeModel("gemini-1.0-pro")
    # More specific prompt engineering
    full_prompt = f"""
    As a professional social media manager, create an engaging and concise caption for the following theme: '{prompt}'.
    
    The caption should:
    - Be attention-grabbing and relevant to the theme.
    - Include 2-3 relevant and popular hashtags.
    - Be suitable for a general audience on platforms like Instagram, Twitter, and Facebook.
    - Do not include any placeholder text like "[Your Brand]".
    """
    response = model.generate_content(full_prompt)
    return response.text

from google.cloud import storage

def generate_image_content(prompt):
    """Generates an image using Imagen and uploads it to GCS."""
    model = vision_models.ImageGenerationModel.from_pretrained("imagegeneration@005")
    images = model.generate_images(prompt=prompt, number_of_images=1)
    
    # Upload to GCS
    bucket_name = "final-myaimediamgr-website-media"
    file_name = f"image-{datetime.utcnow().timestamp()}.png"
    
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    
    # Save the image to a temporary in-memory file
    from io import BytesIO
    image_bytes = BytesIO()
    images[0].save(image_bytes, format='PNG')
    image_bytes.seek(0)
    
    blob.upload_from_file(image_bytes, content_type='image/png')
    
    # Make the blob publicly accessible
    blob.make_public()
    
    return blob.public_url, images[0]

def generate_video_content(prompt):
    """Generates a video using Veo (conceptual)."""
    # Veo integration is conceptual as the API may vary.
    # This is a placeholder for the actual implementation.
    print(f"Conceptual video generation for prompt: {prompt}")
    video_url = f"https://storage.googleapis.com/your-bucket-name/video-{datetime.utcnow().timestamp()}.mp4"
    return video_url, None


content_bp = Blueprint('content', __name__)

@content_bp.route('/content/generate', methods=['POST'])
def generate_content():
    try:
        data = request.get_json()
        theme = data.get('theme')
        uid = data.get('uid')
        content_type = data.get('contentType', 'image')

        if not theme or not uid:
            return jsonify({'error': 'Theme and uid are required'}), 400

        user = User.query.get(uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Quota Check
        if content_type == 'video':
            if user.video_credits_remaining <= 0:
                return jsonify({'error': 'No video credits remaining.'}), 403
        elif content_type in ['image', 'text']:
            if user.image_credits_remaining <= 0:
                return jsonify({'error': 'No image credits remaining.'}), 403
        else:
            return jsonify({'error': 'Invalid content type specified'}), 400

        # Initialize Vertex AI
        project_id = os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website')
        vertexai.init(project=project_id, location="us-central1")

        text_prompt = f'Generate an engaging social media caption for: {theme}. Keep it concise, engaging, and include relevant hashtags.'
        
        text_content = generate_text_content(text_prompt)
        image_url = f"https://via.placeholder.com/400x400/6366f1/ffffff?text={theme.replace(' ', '%20')}"
        video_url = None

        if content_type == 'image':
            image_url, _ = generate_image_content(theme)
        elif content_type == 'video':
            video_url, _ = generate_video_content(theme)

        # Decrement Quota
        if content_type == 'video':
            user.video_credits_remaining -= 1
        elif content_type in ['image', 'text']:
            user.image_credits_remaining -= 1
        
        db.session.commit()

        # Create post object
        post_data = {
            'uid': uid,
            'text': text_content,
            'status': 'pending',
            'createdAt': datetime.utcnow(),
            'theme': theme,
            'imageUrl': image_url,
            'videoUrl': video_url
        }
        
        # Save to Firestore
        firestore_db = firestore.Client(project=project_id)
        doc_ref = firestore_db.collection('posts').add(post_data)
        post_data['id'] = doc_ref[1].id
        
        return jsonify({'success': True, 'data': post_data})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to generate content: {str(e)}'}), 500

@content_bp.route('/content/pending', methods=['GET'])
def get_pending_content():
    try:
        uid = request.args.get('uid')
        if not uid:
            return jsonify({'error': 'uid is required'}), 400
        
        # Query Firestore for pending posts
        posts_ref = db.collection('posts')
        query = posts_ref.where('uid', '==', uid).where('status', '==', 'pending')
        docs = query.stream()
        
        posts = []
        for doc in docs:
            post_data = doc.to_dict()
            post_data['id'] = doc.id
            posts.append(post_data)
        
        # Sort by createdAt
        posts.sort(key=lambda x: x.get('createdAt', datetime.min), reverse=True)
        
        return jsonify({'success': True, 'data': posts})
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch pending content'}), 500

