from app.extensions import db
from datetime import datetime

PromptPriorReading = db.Table('roadmap_prompts_has_previously_read_textual_information',
    db.Column('roadmapPromptsId', db.Integer, db.ForeignKey('roadmap_prompts.id'), primary_key=True), 
    db.Column('textualInformationId', db.Integer, db.ForeignKey('book.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

class RoadmapPrompt(db.Model):
    __tablename__ = 'roadmap_prompts'

    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment="Prompt này của user nào") 
    major = db.Column(db.String, nullable=False, comment="Ngành học") 
    background = db.Column(db.Text, comment="Background bản thân") 
    self_assessment_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced', name='assessment_level_enum'), nullable=False) 
    daily_study_hours = db.Column(db.Float, comment="Giờ học trung bình/ngày") 
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

    # Mối quan hệ
    user = db.relationship('Users', back_populates='prompts')
    generated_roadmaps = db.relationship('Roadmap', back_populates='prompt', lazy=True)
    
    prior_readings = db.relationship('Book', secondary=PromptPriorReading,
                                     backref=db.backref('prompts_using_this_book', lazy='dynamic'))

    def to_dict(self):
        return {
            'prompt_id': self.id,
            # THAY ĐỔI: Từ 'user_id' thành 'user'
            # Gọi .to_dict_simple() để tránh lặp vô hạn
            'user': self.user.to_dict_simple() if self.user else None,
            'major': self.major,
            'background': self.background,
            'self_assessment_level': self.self_assessment_level,
            'daily_study_hours': self.daily_study_hours,
            # THAY ĐỔI: Từ 'prior_reading_ids' thành 'prior_readings'
            'prior_readings': [book.to_dict_simple() for book in self.prior_readings]
        }
    
    def to_dict_simple(self):
        # Dùng khi lồng prompt vào user hoặc roadmap
        return {
            'prompt_id': self.id,
            'user_id': self.userId, # Giữ ID ở đây
            'major': self.major
        }