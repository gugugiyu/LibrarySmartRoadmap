import os
from dotenv import load_dotenv

# Tải các biến môi trường từ tệp .env
load_dotenv()

class Config:
    """Cấu hình cơ sở cho ứng dụng."""
    
    # Lấy khóa bí mật từ biến môi trường
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Cấu hình SQLAlchemy
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False # Đặt là True để xem các câu lệnh SQL

class DevelopmentConfig(Config):
    """Cấu hình cho môi trường phát triển."""
    FLASK_DEBUG = True
    SQLALCHEMY_ECHO = True # Bật log SQL khi phát triển

class ProductionConfig(Config):
    """Cấu hình cho môi trường sản xuất."""
    FLASK_DEBUG = False
    SQLALCHEMY_ECHO = False

# Mapping tên môi trường với class cấu hình
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}