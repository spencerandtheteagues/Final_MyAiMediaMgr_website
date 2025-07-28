import os
import sys
from werkzeug.security import generate_password_hash

# Add project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app, db
from src.models.user import User

def create_admin():
    """Creates the admin user."""
    with app.app_context():
        # Check if admin user already exists
        if User.query.filter_by(username='spencerandtheteagues').first():
            print("Admin user already exists.")
            return

        # Create new admin user
        admin_user = User(
            username='spencerandtheteagues',
            email='spencerandtheteagues@gmail.com',
            password_hash=generate_password_hash('TheMA$TERkey$$'),
            role='admin',
            subscription_tier='enterprise',
            subscription_status='active',
            payment_method_verified=True,
            # Set quotas to a very high number to represent 'unlimited'
            image_quota=999999,
            image_quota_remaining=999999,
            video_v2_quota=999999,
            video_v2_quota_remaining=999999,
            video_v3_quota=999999,
            video_v3_quota_remaining=999999
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully.")

if __name__ == '__main__':
    create_admin()
