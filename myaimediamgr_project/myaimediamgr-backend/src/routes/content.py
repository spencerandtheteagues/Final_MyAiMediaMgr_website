from flask import Blueprint, request, jsonify
import requests
import os
from datetime import datetime

try:
    from google.cloud import firestore
    # Initialize Firestore client with error handling
    try:
        db = firestore.Client(project=os.getenv('GOOGLE_PROJECT_ID', 'final-myaimediamgr-website'))
    except Exception as e:
        print(f"Warning: Could not initialize Firestore: {e}")
        db = None
except ImportError as e:
    print(f"Warning: Could not import Firestore: {e}")
    db = None

content_bp = Blueprint('content', __name__)

@content_bp.route('/content/generate', methods=['POST'])
def generate_content():
    try:
        data = request.get_json()
        theme = data.get('theme')
        uid = data.get('uid')
        
        if not theme or not uid:
            return jsonify({'error': 'Theme and uid are required'}), 400
        
        # Generate AI content using Gemini API
        gemini_api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyDthpeK9UNiHEj2VGtmqp-p_rXR01iLXKs')
        gemini_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={gemini_api_key}'
        
        try:
            response = requests.post(gemini_url, json={
                'contents': [{
                    'parts': [{
                        'text': f'Generate an engaging social media caption for: {theme}. Keep it concise, engaging, and include relevant hashtags.'
                    }]
                }]
            })
            
            if response.status_code == 200 and response.json().get('candidates'):
                text = response.json()['candidates'][0]['content']['parts'][0]['text']
            else:
                text = f"🚀 Exciting content about {theme}! Transform your social media strategy with AI-powered content generation. #AI #SocialMedia #ContentCreation #Innovation"
        except:
            text = f"🚀 Exciting content about {theme}! Transform your social media strategy with AI-powered content generation. #AI #SocialMedia #ContentCreation #Innovation"
        
        # Create post object
        post_data = {
            'uid': uid,
            'text': text,
            'status': 'pending',
            'createdAt': datetime.utcnow(),
            'theme': theme,
            'imageUrl': f"https://via.placeholder.com/400x400/6366f1/ffffff?text={theme.replace(' ', '%20')}"
        }
        
        # Save to Firestore
        doc_ref = db.collection('posts').add(post_data)
        post_data['id'] = doc_ref[1].id
        
        return jsonify({'success': True, 'data': post_data})
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate content'}), 500

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

