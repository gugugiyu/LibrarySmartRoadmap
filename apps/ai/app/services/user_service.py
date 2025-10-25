from app.models.user import Users
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def create_user(data):
    """
    Tạo một user mới.
    'data' là một dict chứa 'email', 'password_hash', 'username', v.v.
    """
    try:
        # Giả sử password_hash đã được hash ở lớp controller hoặc một utility
        new_user = Users(
            email=data.get('email'),
            password_hash=data.get('password_hash'), # Cần hash mật khẩu này!
            username=data.get('username'),
            enrollment_date=data.get('enrollment_date')
        )
        db.session.add(new_user)
        db.session.commit()
        logger.info(f"Đã tạo user mới: {new_user.email}")
        return new_user
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo user: {e}")
        return None
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi không mong muốn khi tạo user: {e}")
        return None

def get_user_by_id(id):
    """Lấy user bằng ID."""
    try:
        return db.session.get(Users, id)
    except Exception as e:
        logger.error(f"Lỗi khi lấy user by ID {id}: {e}")
        return None

def get_all_users(page=1, per_page=20):
    """Lấy danh sách user (phân trang)."""
    try:
        return db.session.query(Users).paginate(page=page, per_page=per_page, error_out=False)
    except Exception as e:
        logger.error(f"Lỗi khi lấy danh sách user: {e}")
        return None

def update_user(id, data):
    """Cập nhật thông tin user."""
    user = get_user_by_id(id)
    if not user:
        return None # Không tìm thấy user

    try:
        # Chỉ cập nhật các trường được phép
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        # (Không nên cập nhật password_hash ở đây trừ khi đó là flow reset pass)

        db.session.commit()
        logger.info(f"Đã cập nhật user ID: {id}")
        return user
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi cập nhật user {id}: {e}")
        return None
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi không mong muốn khi cập nhật user {id}: {e}")
        return None


def delete_user(id):
    """Xóa user."""
    user = get_user_by_id(id)
    if not user:
        return False # Không tìm thấy

    try:
        db.session.delete(user)
        db.session.commit()
        logger.info(f"Đã xóa user ID: {id}")
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi xóa user {id}: {e}")
        return False
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi không mong muốn khi xóa user {id}: {e}")
        return False