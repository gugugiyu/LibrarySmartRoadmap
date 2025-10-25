from flask import request, jsonify, Blueprint, abort
from app.services import document_service
import logging

document_bp = Blueprint('document_api', __name__, url_prefix='/api/v1/documents')
logger = logging.getLogger(__name__)

@document_bp.route('/book', methods=['POST'])
def create_book():
    """
    Tạo một Book document mới.
    Endpoint: POST /api/v1/documents/book
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
    data = request.get_json()
    
    if not data or 'title' not in data:
         abort(400, description="Thiếu trường 'title'.")
         
    book = document_service.create_book(data)
    if not book:
        abort(500, description="Không thể tạo Book.")
        
    return jsonify({"message": "Book created", "id": book.info_id}), 201

@document_bp.route('/article', methods=['POST'])
def create_article():
    """
    Tạo một Article document mới.
    Endpoint: POST /api/v1/documents/article
    """
    if not request.is_json:
        abort(400, description="Yêu cầu phải là JSON.")
    data = request.get_json()
    
    if not data or 'title' not in data:
         abort(400, description="Thiếu trường 'title'.")
         
    article = document_service.create_article(data)
    if not article:
        abort(500, description="Không thể tạo Article.")
        
    return jsonify({"message": "Article created", "id": article.info_id}), 201

@document_bp.route('/<int:info_id>', methods=['GET'])
def get_document(info_id):
    """
    Lấy thông tin document bằng ID.
    Endpoint: GET /api/v1/documents/1
    """
    doc = document_service.get_document_by_id(info_id)
    if not doc:
        abort(404, description="Không tìm thấy Document.")
    
    # Chúng ta cần một cách .to_dict() tốt hơn trên model, 
    # nhưng hiện tại trả về thông tin cơ bản
    return jsonify({
        "info_id": doc.info_id,
        "title": doc.title,
        "type": doc.info_type
    }), 200

@document_bp.route('/', methods=['GET'])
def get_all_documents():
    """
    Lấy danh sách tất cả documents (có phân trang).
    Endpoint: GET /api/v1/documents?page=1&type=book
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    doc_type = request.args.get('type', None, type=str) # 'book' hoặc 'article'
    
    pagination = document_service.get_all_documents(page, per_page, doc_type)
    if not pagination:
        abort(500, description="Lỗi khi truy vấn documents.")
        
    return jsonify({
        'documents': [{"id": d.info_id, "title": d.title, "type": d.info_type} for d in pagination.items],
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'total': pagination.total
    }), 200
    
@document_bp.route('/<int:info_id>', methods=['DELETE'])
def delete_document(info_id):
    """
    Xóa document.
    Endpoint: DELETE /api/v1/documents/1
    """
    success = document_service.delete_document(info_id)
    if not success:
        abort(404, description="Không tìm thấy Document để xóa.")
        
    return '', 204