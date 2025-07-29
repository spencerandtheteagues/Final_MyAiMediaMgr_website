import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from flask import Flask, send_from_directory
    from flask_cors import CORS
    from dotenv import load_dotenv
    from flask_migrate import Migrate
    from src.database import db
    from src.routes.user import user_bp
    from src.routes.content import content_bp
    from src.routes.subscription import subscription_bp

    # Load environment variables
    load_dotenv()

    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

    # Enable CORS
    CORS(app)

    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(content_bp, url_prefix='/api')
    app.register_blueprint(subscription_bp, url_prefix='/api/subscription')

    # Database configuration
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    logging.info(f"Database path configured to: {db_path}")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate = Migrate(app, db)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        static_folder_path = app.static_folder
        if static_folder_path is None:
                logging.error("Static folder not configured")
                return "Static folder not configured", 404

        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                logging.error("index.html not found in static folder")
                return "index.html not found", 404

    logging.info("Application setup complete. Gunicorn will now take over.")

except Exception as e:
    logging.error("An error occurred during application startup:", exc_info=True)
    # We must exit with a non-zero code to fail the container startup
    sys.exit(1)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)

