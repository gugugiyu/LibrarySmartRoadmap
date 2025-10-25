import logging
from app.extensions import db
from app.models.textual_information import TextualInformation, Book, Article
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

logger = logging.getLogger(__name__)

def create_book(data):
    """Tạo một Book mới (và TextualInformation)."""
    try:
        new_book = Book(
            # TextualInformation fields
            title=data.get('title'),
            source_url=data.get('source_url'),
            crawled_at=data.get('crawled_at'),
            # Book fields
            isbn=data.get('isbn'),
            author=data.get('author'),
            publisher=data.get('publisher'),
            abstract=data.get('abstract'),
            publication_year=data.get('publication_year')
        )
        db.session.add(new_book)
        db.session.commit()
        logger.info(f"Đã tạo Book mới ID: {new_book.info_id}")
        return new_book
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo Book: {e}")
        return None

def create_article(data):
    """Tạo một Article mới (và TextualInformation)."""
    try:
        new_article = Article(
            # TextualInformation fields
            title=data.get('title'),
            source_url=data.get('source_url'),
            crawled_at=data.get('crawled_at'),
            # Article fields
            journal_name=data.get('journal_name'),
            doi=data.get('doi'),
            authors=data.get('authors'),
            publication_date=data.get('publication_date')
        )
        db.session.add(new_article)
        db.session.commit()
        logger.info(f"Đã tạo Article mới ID: {new_article.info_id}")
        return new_article
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi tạo Article: {e}")
        return None

def get_document_by_id(info_id):
    """Lấy một document (Book/Article) bằng ID chung."""
    try:
        # SQLAlchemy sẽ tự động trả về đúng loại (Book hoặc Article)
        return db.session.get(TextualInformation, info_id)
    except Exception as e:
        logger.error(f"Lỗi khi lấy document {info_id}: {e}")
        return None

def get_all_documents(page=1, per_page=20, doc_type=None):
    """Lấy danh sách document (phân trang), có thể lọc theo loại."""
    try:
        query = db.session.query(TextualInformation)
        if doc_type == 'book':
            query = query.filter(TextualInformation.info_type == 'book')
        elif doc_type == 'article':
            query = query.filter(TextualInformation.info_type == 'article')
            
        return query.paginate(page=page, per_page=per_page, error_out=False)
    except Exception as e:
        logger.error(f"Lỗi khi lấy danh sách documents: {e}")
        return None

def delete_document(info_id):
    """Xóa một document. Kế thừa TPT sẽ xử lý xóa ở cả hai bảng."""
    doc = get_document_by_id(info_id)
    if not doc:
        return False
    try:
        db.session.delete(doc)
        db.session.commit()
        logger.info(f"Đã xóa document ID: {info_id}")
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Lỗi khi xóa document {info_id}: {e}")
        return False