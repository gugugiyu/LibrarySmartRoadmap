import logging
from app.extensions import db
from app.models.roadmap import Roadmap
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload
from app.models.textual_information import TextualInformation

logger = logging.getLogger(__name__)

def create_roadmap(data):
    """Tạo một Roadmap mới."""
    try:
        new_roadmap = Roadmap(
            prompt_id=data.get('id'),
            user_id=data.get('userId'),
            title=data.get('title'),
            description=data.get('description') 
        )
        db.session.add(new_roadmap)
        db.session.commit()
        logger.info(f"Đã tạo roadmap mới ID: {new_roadmap.roadmap_id}")
        return new_roadmap
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo roadmap: {e}")
        return None

def get_roadmap_by_id(roadmap_id):
    """Lấy roadmap bằng ID (bao gồm cả các node và content của node)."""
    try:
        return db.session.query(Roadmap).options(
            # Tải các node con
            selectinload(Roadmap.nodes)
                # Tải nội dung (Book/Article) của TỪNG node
                .selectinload(RoadmapNode.content),
            # Tải thông tin user tạo roadmap
            joinedload(Roadmap.user)
        ).get(roadmap_id)
    except Exception as e:
        logger.error(f"Lỗi khi lấy roadmap {roadmap_id}: {e}")
        return None

def get_roadmaps_by_user(user_id, page=1, per_page=20):
    """Lấy danh sách roadmap của một user (phân trang)."""
    try:
        return db.session.query(Roadmap)\
            .filter_by(user_id=user_id)\
            .paginate(page=page, per_page=per_page, error_out=False)
    except Exception as e:
        logger.error(f"Lỗi khi lấy roadmaps cho user {user_id}: {e}")
        return None

def update_roadmap(roadmap_id, data):
    """Cập nhật title hoặc description của roadmap."""
    roadmap = get_roadmap_by_id(roadmap_id)
    if not roadmap:
        return None

    try:
        if 'title' in data:
            roadmap.title = data['title']
        if 'description' in data:
            roadmap.description = data['description']

        db.session.commit()
        logger.info(f"Đã cập nhật roadmap ID: {roadmap_id}")
        return roadmap
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi cập nhật roadmap {roadmap_id}: {e}")
        return None

def delete_roadmap(roadmap_id):
    """
    Xóa một roadmap. 
    Các RoadmapNode liên quan sẽ bị xóa theo (do cascade)[cite: 8].
    """
    roadmap = get_roadmap_by_id(roadmap_id)
    if not roadmap:
        return False

    try:
        db.session.delete(roadmap)
        db.session.commit()
        logger.info(f"Đã xóa roadmap ID: {roadmap_id}")
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi xóa roadmap {roadmap_id}: {e}")
        return False