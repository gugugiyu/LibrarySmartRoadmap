import logging
from app.extensions import db
from app.models.roadmap_node import RoadmapNode
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

logger = logging.getLogger(__name__)

def create_node(data):
    """Tạo một RoadmapNode mới."""
    try:
        new_node = RoadmapNode(
            roadmap_id=data.get('roadmap_id')[cite: 7],
            parent_node_id=data.get('parent_node_id')[cite: 7], # Có thể là null
            info_id=data.get('info_id')[cite: 7],         # Có thể là null
            node_order=data.get('node_order', 0)[cite: 7],
            is_completed=data.get('is_completed', False) [cite: 7]
        )
        db.session.add(new_node)
        db.session.commit()
        logger.info(f"Đã tạo node mới ID: {new_node.node_id}")
        return new_node
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo node: {e}")
        return None

def get_node_by_id(node_id):
    """Lấy node bằng ID."""
    try:
        return db.session.get(RoadmapNode, node_id)
    except Exception as e:
        logger.error(f"Lỗi khi lấy node {node_id}: {e}")
        return None

def update_node(node_id, data):
    """Cập nhật một node (vd: is_completed, node_order)."""
    node = get_node_by_id(node_id)
    if not node:
        return None
    
    # Không cho phép cập nhật nếu đã bị soft-delete
    if node.deleted_at:
        logger.warning(f"Cố gắng cập nhật node đã bị xóa {node_id}")
        return None

    try:
        if 'parent_node_id' in data:
            node.parent_node_id = data['parent_node_id']
        if 'info_id' in data:
            node.info_id = data['info_id']
        if 'node_order' in data:
            node.node_order = data['node_order']
        if 'is_completed' in data:
            node.is_completed = data['is_completed']

        db.session.commit()
        logger.info(f"Đã cập nhật node ID: {node_id}")
        return node
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi cập nhật node {node_id}: {e}")
        return None

def soft_delete_node(node_id):
    """
    Soft-delete một node (đặt cờ deleted_at).
    Lưu ý: Logic nghiệp vụ phức tạp (như soft-delete
    toàn bộ cây con) nên được xử lý ở đây nếu cần.
    """
    node = get_node_by_id(node_id)
    if not node:
        return False
    
    if node.deleted_at: # Đã xóa rồi
        return True

    try:
        node.deleted_at = datetime.utcnow()
        # TODO: Thêm logic đệ quy để soft-delete các node con nếu cần
        
        db.session.commit()
        logger.info(f"Đã soft-delete node ID: {node_id}")
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi soft-delete node {node_id}: {e}")
        return False