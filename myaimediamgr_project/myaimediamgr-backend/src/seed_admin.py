import os
import sys
from werkzeug.security import generate_password_hash

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app, db
from src.models.user import User

def create_or_update_admin():
    """Creates or updates the admin user."""
    with app.app_context():
        user = User.query.filter_by(username='spencerandtheteagues').first()
        if user:
            print("Admin user found. Updating credits...")
            user.image_credits = 999999
            user.image_credits_remaining = 999999
            user.video_credits = 999999
            user.video_credits_remaining = 999999
            print("Admin credits updated.")
        else:
            print("Admin user not found. Creating...")
            user = User(
                username='spencerandtheteagues',
                email='spencerandtheteagues@gmail.com',
                password_hash=generate_password_hash('TheMA$TERkey$$'),
                role='admin',
                subscription_tier='enterprise',
                subscription_status='active',
                payment_method_verified=True,
                image_credits=999999,
                image_credits_remaining=999999,
                video_credits=999999,
                video_credits_remaining=999999
            )
            db.session.add(user)
            print("Admin user created successfully.")
        
        db.session.commit()
        print(f"Admin user ID: {user.id}")

if __name__ == '__main__':
    create_or_update_admin()