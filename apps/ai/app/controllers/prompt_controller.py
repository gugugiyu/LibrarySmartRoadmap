from flask import request, jsonify, Blueprint, abort
from app.services import prompt_service
import logging

prompt_bp = Blueprint('prompt_api', __name__, url_prefix='/api/v1/prompts')
logger = logging.getLogger(__name__)

@prompt_bp.route('/', methods=['POST'])
def create_prompt():
    """
    Tạo một roadmap prompt mới.
    Endpoint: POST /api/v1/prompts
    Body: { "user_id": 1, "major": "...", "prior_reading_ids": [1, 2] }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['user_id', 'major', 'self_assessment_level']
    if not all(field in data for field in required_fields):
        abort(400, description=f"Thiếu các trường bắt buộc: {required_fields}")

    prompt = prompt_service.create_prompt(data)
    if not prompt:
        abort(500, description="Không thể tạo prompt.")
        
    return jsonify(prompt.to_dict()), 201

@prompt_bp.route('/<int:prompt_id>', methods=['GET'])
def get_prompt(prompt_id):
    """
    Lấy thông tin prompt bằng ID.
    Endpoint: GET /api/v1/prompts/1
    """
    prompt = prompt_service.get_prompt_by_id(prompt_id)
    if not prompt:
        abort(404, description="Không tìm thấy Prompt.")
        
    return jsonify(prompt.to_dict()), 200

@prompt_bp.route('/user/<int:user_id>', methods=['GET'])
def get_prompts_by_user(user_id):
    """
    Lấy danh sách prompts của một user.
    Endpoint: GET /api/v1/prompts/user/1?page=1
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = prompt_service.get_prompts_by_user(user_id, page, per_page)
    if not pagination:
        abort(500, description="Lỗi khi truy vấn prompts.")

    return jsonify({
        'prompts': [p.to_dict() for p in pagination.items],
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'total': pagination.total
    }), 200

@prompt_bp.route('/<int:prompt_id>', methods=['PUT'])
def update_prompt(prompt_id):
    """
    Cập nhật prompt.
    Endpoint: PUT /api/v1/prompts/1
    Body: { "background": "New background..." }
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
        
    data = request.get_json()
    prompt = prompt_service.update_prompt(prompt_id, data)
    
    if not prompt:
        abort(404, description="Không tìm thấy Prompt để cập nhật.")
        
    return jsonify(prompt.to_dict()), 200

@prompt_bp.route('/<int:prompt_id>', methods=['DELETE'])
def delete_prompt(prompt_id):
    """
    Xóa prompt.
    Endpoint: DELETE /api/v1/prompts/1
    """
    success = prompt_service.delete_prompt(prompt_id)
    if not success:
        abort(404, description="Không tìm thấy Prompt để xóa.")
        
    return '', 204