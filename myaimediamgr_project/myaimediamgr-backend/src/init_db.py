import os
from alembic.config import Config
from alembic import command
from src.seed_admin import create_or_update_admin
from src.main import app  # Import the app to ensure context is available

def initialize_database():
    """
    Runs database migrations and seeds the admin user in a single process.
    """
    with app.app_context():
        print("--- Running Database Migrations ---")
        # Get the absolute path to the migrations directory
        migrations_dir = os.path.join(os.path.dirname(__file__), '..', 'migrations')
        alembic_cfg = Config()
        alembic_cfg.set_main_option("script_location", migrations_dir)
        command.upgrade(alembic_cfg, "head")
        print("--- Database Migrations Complete ---")

        print("--- Seeding Admin User ---")
        create_or_update_admin()
        print("--- Admin User Seeding Complete ---")

if __name__ == "__main__":
    initialize_database()
