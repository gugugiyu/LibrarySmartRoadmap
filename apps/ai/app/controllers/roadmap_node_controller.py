from flask import request, jsonify, Blueprint, abort
from app.services import roadmap_node_service
import logging

node_bp = Blueprint('node_api', __name__, url_prefix='/api/v1/nodes')
logger = logging.getLogger(__name__)

@node_bp.route('/', methods=['POST'])
def create_node():
    """
    Tạo một roadmap node mới.
    Endpoint: POST /api/v1/nodes
    Body: { "roadmap_id": 1, "parent_node_id": null, "info_id": 10 }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    
    if 'roadmap_id' not in data:
        abort(400, description="Thiếu 'roadmap_id'.")

    node = roadmap_node_service.create_node(data)
    if not node:
        abort(500, description="Không thể tạo node.")
        
    return jsonify(node.to_dict()), 201

@node_bp.route('/<int:node_id>', methods=['GET'])
def get_node(node_id):
    """
    Lấy thông tin node bằng ID.
    Endpoint: GET /api/v1/nodes/1
    """
    node = roadmap_node_service.get_node_by_id(node_id)
    if not node:
        abort(404, description="Không tìm thấy Node.")
    
    # Kiểm tra soft-delete
    if node.deleted_at:
        abort(404, description="Node này đã bị xóa.")
        
    return jsonify(node.to_dict()), 200

@node_bp.route('/<int:node_id>', methods=['PUT'])
def update_node(node_id):
    """
    Cập nhật node (vd: đánh dấu hoàn thành).
    Endpoint: PUT /api/v1/nodes/1
    Body: { "is_completed": true }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    node = roadmap_node_service.update_node(node_id, data)
    
    if not node:
        abort(404, description="Không tìm thấy Node để cập nhật (hoặc đã bị xóa).")
        
    return jsonify(node.to_dict()), 200

@node_bp.route('/<int:node_id>', methods=['DELETE'])
def delete_node(node_id):
    """
    Soft-delete một node.
    Endpoint: DELETE /api/v1/nodes/1
    """
    success = roadmap_node_service.soft_delete_node(node_id)
    if not success:
        abort(404, description="Không tìm thấy Node để xóa.")
        
    return '', 204