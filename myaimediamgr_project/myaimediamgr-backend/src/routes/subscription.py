from flask import Blueprint, jsonify, request
from src.models.user import User, db
from datetime import datetime, timedelta
import os

subscription_bp = Blueprint('subscription', __name__)

# New, updated subscription plans configuration
SUBSCRIPTION_PLANS = {
    'starter': {
        'name': 'Starter',
        'price_monthly': 39,
        'image_credits': 100,
        'video_credits': 0,
        'features': ['Text posts', 'Scheduler', 'Manual uploads', '1 campaign']
    },
    'pro': {
        'name': 'Pro',
        'price_monthly': 119,
        'image_credits': 300,
        'video_credits': 5,
        'features': ['All Starter features', 'Campaign automation', 'Post previews']
    },
    'business': {
        'name': 'Business',
        'price_monthly': 229,
        'image_credits': 600,
        'video_credits': 10,
        'features': ['All Pro features', 'Team collaboration', 'Analytics', 'Multi-user access']
    },
    'enterprise': {
        'name': 'Enterprise',
        'price_monthly': 399,
        'image_credits': 1200,
        'video_credits': 20,
        'features': ['All Business features', 'API access', 'Priority support', 'Discounted video add-ons']
    }
}

ADDON_PACKS = {
    'image_100': {'price': 4.99, 'image_credits': 100},
    'video_1': {'price': 6.99, 'video_credits': 1},
    'video_5': {'price': 29.99, 'video_credits': 5},
}

@subscription_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get available subscription plans"""
    return jsonify({
        'success': True,
        'plans': SUBSCRIPTION_PLANS,
        'addons': ADDON_PACKS
    })

@subscription_bp.route('/user/subscription', methods=['GET'])
def get_user_subscription():
    """Get current user's subscription status"""
    user_id = request.args.get('user_id', 1)
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    return jsonify({'success': True, 'subscription': user.to_dict()})

@subscription_bp.route('/user/subscription/upgrade', methods=['POST'])
def upgrade_subscription():
    """Upgrade user subscription"""
    data = request.json
    user_id = data.get('user_id')
    plan = data.get('plan')
    
    if not user_id or not plan:
        return jsonify({'success': False, 'error': 'User ID and plan are required'}), 400

    if plan not in SUBSCRIPTION_PLANS:
        return jsonify({'success': False, 'error': 'Invalid plan'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    plan_details = SUBSCRIPTION_PLANS[plan]
    user.subscription_tier = plan
    user.subscription_status = 'active'
    user.subscription_start_date = datetime.utcnow()
    user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
    user.quota_reset_date = datetime.utcnow() + timedelta(days=30)
    
    # Reset credits to the new plan's allocation
    user.image_credits = plan_details['image_credits']
    user.image_credits_remaining = plan_details['image_credits']
    user.video_credits = plan_details['video_credits']
    user.video_credits_remaining = plan_details['video_credits']
    
    user.payment_method_verified = True # Simulate successful payment
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Successfully upgraded to {plan} plan',
        'user': user.to_dict()
    })

@subscription_bp.route('/user/credits/add', methods=['POST'])
def add_credits():
    """Purchase add-on credit packs"""
    data = request.json
    user_id = data.get('user_id')
    pack_id = data.get('pack_id')

    if not user_id or not pack_id:
        return jsonify({'success': False, 'error': 'User ID and pack ID are required'}), 400

    if pack_id not in ADDON_PACKS:
        return jsonify({'success': False, 'error': 'Invalid add-on pack'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    pack_details = ADDON_PACKS[pack_id]
    
    # In a real app, you would process payment here via Stripe
    
    if 'image_credits' in pack_details:
        user.image_credits_remaining += pack_details['image_credits']
    if 'video_credits' in pack_details:
        user.video_credits_remaining += pack_details['video_credits']
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Credits added successfully',
        'user': user.to_dict()
    })

@subscription_bp.route('/user/subscription/cancel', methods=['POST'])
def cancel_subscription():
    """Cancel user subscription"""
    data = request.json
    user_id = data.get('user_id')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    user.subscription_status = 'cancelled'
    # Access remains until the end of the current billing period.
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Subscription cancelled successfully',
        'access_until': user.subscription_end_date.isoformat() if user.subscription_end_date else None
    })


