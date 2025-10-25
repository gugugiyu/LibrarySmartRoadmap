# Import các blueprints
from .user_controller import user_bp
from .prompt_controller import prompt_bp
from .document_controller import document_bp
from .roadmap_controller import roadmap_bp
from .roadmap_node_controller import node_bp

def register_blueprints(app):
    """
    Đăng ký tất cả các blueprints với ứng dụng Flask.
    """
    app.logger.info("Đăng ký blueprints...")
    app.register_blueprint(user_bp)
    app.register_blueprint(prompt_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(node_bp)
    app.logger.info("Đăng ký blueprints hoàn tất.")