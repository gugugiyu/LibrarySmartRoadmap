import os
import logging
from flask import Flask
from config import config_by_name
from .extensions import db, migrate

def create_app(config_name=None):
    """
    Hàm factory để tạo ứng dụng Flask.
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Thiết lập logging
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
                        datefmt='%Y-%m-%d %H:%M:%S')

    app.logger.info(f"Khởi tạo ứng dụng với cấu hình: {config_name}")

    # Khởi tạo các tiện ích mở rộng
    db.init_app(app)
    migrate.init_app(app, db)

    # Đăng ký Blueprints (Controllers)
    with app.app_context():
        from .controllers import register_blueprints
        register_blueprints(app)

        # Import models để Flask-Migrate có thể nhận diện
        from . import models 

    return app