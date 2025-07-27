from flask import Blueprint, jsonify, request
from src.models.user import User, db
from datetime import datetime, timedelta
import os

subscription_bp = Blueprint('subscription', __name__)

# Subscription plans configuration
SUBSCRIPTION_PLANS = {
    'starter': {
        'name': 'Starter',
        'price_monthly': 29,
        'price_annual': 290,  # 10 months price
        'credits': 500,
        'features': ['Basic AI content generation', 'Up to 3 platforms', 'Email support']
    },
    'pro': {
        'name': 'Pro',
        'price_monthly': 79,
        'price_annual': 790,  # 10 months price
        'credits': 2000,
        'features': ['Advanced AI content generation', 'Video generation', 'Up to 10 platforms', 'Priority support', 'Analytics']
    },
    'agency': {
        'name': 'Agency',
        'price_monthly': 199,
        'price_annual': 1990,  # 10 months price
        'credits': 10000,
        'features': ['White-label tools', 'Team access', 'Unlimited platforms', 'Custom analytics', 'Dedicated support']
    }
}

@subscription_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get available subscription plans"""
    return jsonify({
        'success': True,
        'plans': SUBSCRIPTION_PLANS
    })

@subscription_bp.route('/user/subscription', methods=['GET'])
def get_user_subscription():
    """Get current user's subscription status"""
    # For demo purposes, we'll use a mock user ID
    # In production, this would come from authentication
    user_id = request.args.get('user_id', 1)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    # Calculate trial days remaining
    trial_days_remaining = 0
    if user.is_trial_active() and user.trial_end_date:
        trial_days_remaining = max(0, (user.trial_end_date - datetime.utcnow()).days)
    
    return jsonify({
        'success': True,
        'subscription': {
            'tier': user.subscription_tier,
            'status': user.subscription_status,
            'has_access': user.has_access(),
            'is_trial_active': user.is_trial_active(),
            'is_subscription_active': user.is_subscription_active(),
            'trial_days_remaining': trial_days_remaining,
            'trial_end_date': user.trial_end_date.isoformat() if user.trial_end_date else None,
            'credits_remaining': user.credits_remaining,
            'credits_total': user.credits_total,
            'payment_method_verified': user.payment_method_verified,
            'current_plan': SUBSCRIPTION_PLANS.get(user.subscription_tier, {})
        }
    })

@subscription_bp.route('/user/subscription/upgrade', methods=['POST'])
def upgrade_subscription():
    """Upgrade user subscription"""
    data = request.json
    user_id = data.get('user_id', 1)
    plan = data.get('plan')
    billing_cycle = data.get('billing_cycle', 'monthly')  # monthly or annual
    
    if plan not in SUBSCRIPTION_PLANS:
        return jsonify({'success': False, 'error': 'Invalid plan'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    # Update user subscription
    user.subscription_tier = plan
    user.subscription_status = 'active'
    user.subscription_start_date = datetime.utcnow()
    
    # Set subscription end date based on billing cycle
    if billing_cycle == 'annual':
        user.subscription_end_date = datetime.utcnow() + timedelta(days=365)
    else:
        user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
    
    # Update credits
    user.credits_total = SUBSCRIPTION_PLANS[plan]['credits']
    user.credits_remaining = SUBSCRIPTION_PLANS[plan]['credits']
    user.payment_method_verified = True
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Successfully upgraded to {plan} plan',
        'subscription': user.to_dict()
    })

@subscription_bp.route('/user/subscription/verify-payment', methods=['POST'])
def verify_payment_method():
    """Verify payment method with $1 authorization"""
    data = request.json
    user_id = data.get('user_id', 1)
    payment_method_id = data.get('payment_method_id')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    # In production, this would integrate with Stripe
    # For demo purposes, we'll simulate successful verification
    user.payment_method_verified = True
    user.stripe_customer_id = f"cus_demo_{user_id}"
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Payment method verified successfully',
        'authorization_amount': 100,  # $1.00 in cents
        'refunded': True
    })

@subscription_bp.route('/user/subscription/cancel', methods=['POST'])
def cancel_subscription():
    """Cancel user subscription"""
    data = request.json
    user_id = data.get('user_id', 1)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    user.subscription_status = 'cancelled'
    # Keep access until the end of the current billing period
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Subscription cancelled successfully',
        'access_until': user.subscription_end_date.isoformat() if user.subscription_end_date else None
    })

@subscription_bp.route('/user/credits/usage', methods=['POST'])
def use_credits():
    """Deduct credits for content generation"""
    data = request.json
    user_id = data.get('user_id', 1)
    credits_used = data.get('credits_used', 1)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    if not user.has_access():
        return jsonify({'success': False, 'error': 'No active subscription or trial'}), 403
    
    if user.credits_remaining < credits_used:
        return jsonify({'success': False, 'error': 'Insufficient credits'}), 400
    
    user.credits_remaining -= credits_used
    db.session.commit()
    
    return jsonify({
        'success': True,
        'credits_remaining': user.credits_remaining,
        'credits_used': credits_used
    })

