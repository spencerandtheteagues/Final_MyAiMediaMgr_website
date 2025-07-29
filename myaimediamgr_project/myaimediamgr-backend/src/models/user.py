from src.database import db
from datetime import datetime, timedelta

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'

    # Subscription fields
    subscription_tier = db.Column(db.String(20), default='trial')  # trial, starter, pro, business, enterprise
    subscription_status = db.Column(db.String(20), default='trialing')  # trialing, active, expired, canceled
    trial_start_date = db.Column(db.DateTime, default=datetime.utcnow)
    trial_end_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=14))
    subscription_start_date = db.Column(db.DateTime)
    subscription_end_date = db.Column(db.DateTime)
    quota_reset_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))

    # Quota fields - Based on new pricing model
    image_credits = db.Column(db.Integer, default=100)
    image_credits_remaining = db.Column(db.Integer, default=100)
    video_credits = db.Column(db.Integer, default=0)
    video_credits_remaining = db.Column(db.Integer, default=0)

    # Payment information
    stripe_customer_id = db.Column(db.String(100))
    stripe_subscription_id = db.Column(db.String(100))
    payment_method_verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'
    
    def is_trial_active(self):
        """Check if user's trial is still active"""
        return (self.subscription_status == 'trialing' and 
                self.trial_end_date and 
                datetime.utcnow() < self.trial_end_date)
    
    def is_subscription_active(self):
        """Check if user has an active subscription"""
        return (self.subscription_status == 'active' and 
                self.subscription_end_date and 
                datetime.utcnow() < self.subscription_end_date)
    
    def has_access(self):
        """Check if user has access to the platform"""
        return self.is_trial_active() or self.is_subscription_active() or self.role == 'admin'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'subscription_tier': self.subscription_tier,
            'subscription_status': self.subscription_status,
            'trial_start_date': self.trial_start_date.isoformat() if self.trial_start_date else None,
            'trial_end_date': self.trial_end_date.isoformat() if self.trial_end_date else None,
            'subscription_start_date': self.subscription_start_date.isoformat() if self.subscription_start_date else None,
            'subscription_end_date': self.subscription_end_date.isoformat() if self.subscription_end_date else None,
            'quota_reset_date': self.quota_reset_date.isoformat() if self.quota_reset_date else None,
            'image_credits': self.image_credits,
            'image_credits_remaining': self.image_credits_remaining,
            'video_credits': self.video_credits,
            'video_credits_remaining': self.video_credits_remaining,
            'payment_method_verified': self.payment_method_verified,
            'has_access': self.has_access(),
            'is_trial_active': self.is_trial_active(),
            'is_subscription_active': self.is_subscription_active(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
