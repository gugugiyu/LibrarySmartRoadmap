from app.extensions import db
from datetime import datetime

class TextualInformation(db.Model):
    __tablename__ = 'textual_information'

    id = db.Column(db.Integer, primary_key=True, comment="Primary key chung") # [cite: 3]
    title = db.Column(db.String) # [cite: 3]
    source_url = db.Column(db.String, unique=True, comment="URL gốc được crawl") # [cite: 3]
    info_type = db.Column(db.String(50), nullable=False) # [cite: 3] # (book, article)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 3]
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 3]

    # Mối quan hệ tới RoadmapNode
    roadmap_nodes = db.relationship('RoadmapNode', back_populates='content', lazy=True)

    __mapper_args__ = {
        'polymorphic_identity': 'textual_information',
        'polymorphic_on': info_type
    }
    
    def to_dict_base(self):
        return {
            'id': self.id,
            'title': self.title,
            'source_url': self.source_url,
            'info_type': self.info_type
        }

class Book(TextualInformation):
    __tablename__ = 'book'
    
    id = db.Column(db.Integer, db.ForeignKey('textual_information.id'), primary_key=True, comment="Kế thừa từ TextualInformation (TPT)") # [cite: 4, 9]
    isbn = db.Column(db.String, unique=True) # [cite: 4]
    author = db.Column(db.String) # [cite: 4]
    publisher = db.Column(db.String) # [cite: 4]
    abstract = db.Column(db.Text) # [cite: 4]
    publication_year = db.Column(db.Integer) # [cite: 4]

    __mapper_args__ = {
        'polymorphic_identity': 'book',
    }
    
    def to_dict_simple(self):
        # Lấy các trường base và thêm các trường của Book
        base_dict = super().to_dict_base()
        base_dict.update({
            'isbn': self.isbn,
            'author': self.author,
            'publication_year': self.publication_year
        })
        return base_dict

class Article(TextualInformation):
    __tablename__ = 'article'
    
    id = db.Column(db.Integer, db.ForeignKey('textual_information.id'), primary_key=True, comment="Kế thừa từ TextualInformation (TPT)") # [cite: 5, 10]
    journal_name = db.Column(db.String, comment="Tên tạp chí học thuật") # [cite: 5]
    doi = db.Column(db.String, unique=True, comment="Digital Object Identifier") # [cite: 5]
    authors = db.Column(db.Text) # [cite: 5]
    publication_date = db.Column(db.DateTime) # [cite: 5]

    __mapper_args__ = {
        'polymorphic_identity': 'article',
    }