from flask import Blueprint, jsonify, request
from src.models.user import User, db
from datetime import datetime, timedelta

user_bp = Blueprint('user', __name__)

@user_bp.route('/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.json
    username = data.get('username')
    password = data.get('password')  # In production, verify password hash
    
    if not username:
        return jsonify({'success': False, 'error': 'Username required'}), 400
    
    # Find or create user for demo purposes
    user = User.query.filter_by(username=username).first()
    if not user:
        # Create new user with trial
        user = User(
            username=username,
            email=data.get('email', f"{username}@example.com"),
            subscription_tier='trial',
            subscription_status='trial',
            trial_start_date=datetime.utcnow(),
            trial_end_date=datetime.utcnow() + timedelta(days=14),
            credits_remaining=500,
            credits_total=500
        )
        db.session.add(user)
        db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': f"demo_token_{user.id}"  # In production, use JWT
    })

@user_bp.route('/auth/check-access', methods=['GET'])
def check_access():
    """Check if user has access to the platform"""
    user_id = request.args.get('user_id', 1)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    has_access = user.has_access()
    
    response_data = {
        'success': True,
        'has_access': has_access,
        'subscription_status': user.subscription_status,
        'subscription_tier': user.subscription_tier,
        'payment_method_verified': user.payment_method_verified
    }
    
    if not has_access:
        response_data['redirect_to'] = '/subscribe'
        response_data['message'] = 'Subscription required to access this feature'
    
    if user.is_trial_active():
        trial_days_remaining = max(0, (user.trial_end_date - datetime.utcnow()).days)
        response_data['trial_days_remaining'] = trial_days_remaining
        response_data['trial_end_date'] = user.trial_end_date.isoformat()
    
    return jsonify(response_data)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user = User(
        username=data['username'], 
        email=data['email'],
        subscription_tier='trial',
        subscription_status='trial',
        trial_start_date=datetime.utcnow(),
        trial_end_date=datetime.utcnow() + timedelta(days=14),
        credits_remaining=500,
        credits_total=500
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
