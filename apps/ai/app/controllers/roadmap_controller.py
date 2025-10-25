from flask import request, jsonify, Blueprint, abort
from app.services import roadmap_service
import logging

roadmap_bp = Blueprint('roadmap_api', __name__, url_prefix='/api/v1/roadmaps')
logger = logging.getLogger(__name__)

@roadmap_bp.route('/', methods=['POST'])
def create_roadmap():
    """
    Tạo một roadmap mới.
    Endpoint: POST /api/v1/roadmaps
    Body: { "id": 1, "prompt_id": 1, "title": "My CS Roadmap" }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    
    required_fields = ['id', 'prompt_id', 'title']
    if not all(field in data for field in required_fields):
        abort(400, description=f"Thiếu các trường bắt buộc: {required_fields}")

    roadmap = roadmap_service.create_roadmap(data)
    if not roadmap:
        abort(500, description="Không thể tạo roadmap.")
        
    return jsonify(roadmap.to_dict()), 201

@roadmap_bp.route('/<int:roadmap_id>', methods=['GET'])
def get_roadmap(roadmap_id):
    """
    Lấy thông tin roadmap bằng ID.
    Endpoint: GET /api/v1/roadmaps/1
    """
    roadmap = roadmap_service.get_roadmap_by_id(roadmap_id)
    if not roadmap:
        abort(404, description="Không tìm thấy Roadmap.")
        
    # .to_dict() trên model Roadmap cần được mở rộng để trả về các node
    return jsonify(roadmap.to_dict()), 200

@roadmap_bp.route('/user/<int:id>', methods=['GET'])
def get_roadmaps_by_user(id):
    """
    Lấy danh sách roadmaps của một user.
    Endpoint: GET /api/v1/roadmaps/user/1?page=1
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = roadmap_service.get_roadmaps_by_user(id, page, per_page)
    if not pagination:
        abort(500, description="Lỗi khi truy vấn roadmaps.")

    return jsonify({
        'roadmaps': [r.to_dict() for r in pagination.items],
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'total': pagination.total
    }), 200

@roadmap_bp.route('/<int:roadmap_id>', methods=['PUT'])
def update_roadmap(roadmap_id):
    """
    Cập nhật roadmap (title, description).
    Endpoint: PUT /api/v1/roadmaps/1
    Body: { "title": "New Title" }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    roadmap = roadmap_service.update_roadmap(roadmap_id, data)
    
    if not roadmap:
        abort(404, description="Không tìm thấy Roadmap để cập nhật.")
        
    return jsonify(roadmap.to_dict()), 200

@roadmap_bp.route('/<int:roadmap_id>', methods=['DELETE'])
def delete_roadmap(roadmap_id):
    """
    Xóa roadmap (và các node của nó).
    Endpoint: DELETE /api/v1/roadmaps/1
    """
    success = roadmap_service.delete_roadmap(roadmap_id)
    if not success:
        abort(404, description="Không tìm thấy Roadmap để xóa.")
        
    return '', 204