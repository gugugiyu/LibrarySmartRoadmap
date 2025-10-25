import logging
from app.extensions import db
from app.models.prompt import RoadmapPrompt
from app.models.textual_information import Book
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

def create_prompt(data):
    """
    Tạo một RoadmapPrompt mới.
    'data' chứa các trường và một list 'prior_reading_ids'.
    """
    try:
        new_prompt = RoadmapPrompt(
            id=data.get('id'),
            major=data.get('major'),
            background=data.get('background'),
            self_assessment_level=data.get('self_assessment_level'),
            daily_study_hours=data.get('daily_study_hours')
        )
        
        # Xử lý M-N 'prior_readings'
        book_ids = data.get('prior_reading_ids', [])
        if book_ids:
            # Lọc ra các sách tồn tại
            books = db.session.query(Book).filter(Book.info_id.in_(book_ids)).all()
            new_prompt.prior_readings.extend(books)
            
        db.session.add(new_prompt)
        db.session.commit()
        logger.info(f"Đã tạo prompt mới ID: {new_prompt.prompt_id}")
        return new_prompt
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo prompt: {e}")
        return None

def get_prompt_by_id(prompt_id):
    """Lấy prompt bằng ID."""
    try:
        return db.session.get(RoadmapPrompt, prompt_id)
    except Exception as e:
        logger.error(f"Lỗi khi lấy prompt {prompt_id}: {e}")
        return None

def get_prompts_by_user(id, page=1, per_page=20):
    """Lấy danh sách prompt của một user (phân trang)."""
    try:
        return db.session.query(RoadmapPrompt)\
            .filter_by(id=id)\
            .paginate(page=page, per_page=per_page, error_out=False)
    except Exception as e:
        logger.error(f"Lỗi khi lấy prompts cho user {id}: {e}")
        return None

def update_prompt(prompt_id, data):
    """Cập nhật một prompt."""
    prompt = get_prompt_by_id(prompt_id)
    if not prompt:
        return None

    try:
        if 'major' in data:
            prompt.major = data['major']
        if 'background' in data:
            prompt.background = data['background']
        if 'self_assessment_level' in data:
            prompt.self_assessment_level = data['self_assessment_level']
        if 'daily_study_hours' in data:
            prompt.daily_study_hours = data['daily_study_hours']
            
        # Cập nhật M-N
        if 'prior_reading_ids' in data:
            prompt.prior_readings.clear() # Xóa các sách cũ
            book_ids = data.get('prior_reading_ids', [])
            if book_ids:
                books = db.session.query(Book).filter(Book.info_id.in_(book_ids)).all()
                prompt.prior_readings.extend(books)

        db.session.commit()
        logger.info(f"Đã cập nhật prompt ID: {prompt_id}")
        return prompt
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi cập nhật prompt {prompt_id}: {e}")
        return None

def delete_prompt(prompt_id):
    """Xóa một prompt."""
    prompt = get_prompt_by_id(prompt_id)
    if not prompt:
        return False

    try:
        db.session.delete(prompt)
        db.session.commit()
        logger.info(f"Đã xóa prompt ID: {prompt_id}")
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi xóa prompt {prompt_id}: {e}")
        return False