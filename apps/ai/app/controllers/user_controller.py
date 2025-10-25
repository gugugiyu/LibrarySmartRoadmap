from flask import request, jsonify, Blueprint, current_app, abort
from app.services import user_service
import logging

# Tạo một Blueprint. Tên 'user_api' sẽ được dùng nội bộ
# 'url_prefix' sẽ được thêm vào trước tất cả các route trong blueprint này
user_bp = Blueprint('user_api', __name__, url_prefix='/api/v1/users')

logger = logging.getLogger(__name__)

@user_bp.route('/', methods=['POST'])
def create_user():
    """
    Tạo user mới.
    Endpoint: POST /api/v1/users
    Body: { "email": "...", "password_hash": "...", "username": "..." }
    """
    if not request.is_json:
        logger.warning("Yêu cầu tạo user không phải JSON")
        abort(400, description="Yêu cầu phải là JSON.")

    data = request.get_json()

    # --- Xử lý Edge Case: Thiếu trường bắt buộc ---
    if not data or 'email' not in data or 'password_hash' not in data:
        logger.warning(f"Yêu cầu tạo user thiếu trường: {data}")
        abort(400, description="Thiếu 'email' hoặc 'password_hash'.")

    # TODO: Hash mật khẩu TRƯỚC KHI gọi service
    # Ví dụ: data['password_hash'] = hash_password_hash(data['password_hash'])
    # Vì mục đích demo, chúng ta tạm bỏ qua (NHƯNG RẤT QUAN TRỌNG TRONG THỰC TẾ)
    data['password_hash'] = "hashed_" + data['password_hash'] # DEMO HASHING

    try:
        new_user = user_service.create_user(data)
        if new_user:
            return jsonify(new_user.to_dict()), 201 # 201 Created
        else:
            abort(500, description="Không thể tạo user do lỗi server.")
    except Exception as e:
        logger.error(f"Lỗi controller khi tạo user: {e}")
        abort(500, description=str(e))

@user_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    """
    Lấy thông tin user bằng ID.
    Endpoint: GET /api/v1/users/123
    """
    logger.info(f"Nhận yêu cầu GET cho user ID: {id}")
    user = user_service.get_user_by_id(id)

    # --- Xử lý Edge Case: Không tìm thấy ---
    if not user:
        logger.warning(f"Không tìm thấy user ID: {id}")
        abort(404, description=f"Không tìm thấy User với ID {id}.")

    return jsonify(user.to_dict()), 200

@user_bp.route('/', methods=['GET'])
def get_all_users():
    """
    Lấy danh sách tất cả user (có phân trang).
    Endpoint: GET /api/v1/users?page=1&per_page=10
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = user_service.get_all_users(page, per_page)
    if not pagination:
        abort(500, description="Lỗi khi truy vấn danh sách user.")
        
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'total_users': pagination.total
    }), 200

@user_bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    """
    Cập nhật thông tin user.
    Endpoint: PUT /api/v1/users/123
    Body: { "username": "New Name" }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")

    data = request.get_json()
    
    updated_user = user_service.update_user(id, data)

    # --- Xử lý Edge Case: Không tìm thấy ---
    if not updated_user:
        abort(404, description=f"Không tìm thấy User với ID {id} để cập nhật.")

    return jsonify(updated_user.to_dict()), 200

@user_bp.route('/<int:id>', methods=['DELETE'])
def delete_user(id):
    """
    Xóa user.
    Endpoint: DELETE /api/v1/users/123
    """
    success = user_service.delete_user(id)
    
    # --- Xử lý Edge Case: Không tìm thấy ---
    if not success:
        abort(404, description=f"Không tìm thấy User với ID {id} để xóa.")

    return '', 204 # 204 No Content (Xóa thành công)