from app.extensions import db
from datetime import datetime

# Bảng liên kết Many-to-Many
PromptPriorReading = db.Table('prompt_prior_reading',
    db.Column('prompt_id', db.Integer, db.ForeignKey('roadmap_prompt.prompt_id'), primary_key=True), # [cite: 2]
    db.Column('book_info_id', db.Integer, db.ForeignKey('book.info_id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

class RoadmapPrompt(db.Model):
    __tablename__ = 'roadmap_prompt'

    prompt_id = db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment="Prompt này của user nào") # [cite: 2]
    major = db.Column(db.String, nullable=False, comment="Ngành học") # [cite: 2]
    background = db.Column(db.Text, comment="Background bản thân") # [cite: 2]
    self_assessment_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced', name='assessment_level_enum'), nullable=False) # [cite: 2]
    daily_study_hours = db.Column(db.Float, comment="Giờ học trung bình/ngày") # [cite: 2]
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 2]
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 2]

    # Mối quan hệ
    user = db.relationship('Users', back_populates='prompts')
    generated_roadmaps = db.relationship('Roadmap', back_populates='prompt', lazy=True)
    
    # Mối quan hệ M-N với Book
    prior_readings = db.relationship('Book', secondary=PromptPriorReading,
                                     backref=db.backref('prompts_using_this_book', lazy='dynamic'))

    def to_dict(self):
        return {
            'prompt_id': self.prompt_id,
            'id': self.id,
            'major': self.major,
            'background': self.background,
            'self_assessment_level': self.self_assessment_level,
            'daily_study_hours': self.daily_study_hours,
            'prior_reading_ids': [book.info_id for book in self.prior_readings]
        }