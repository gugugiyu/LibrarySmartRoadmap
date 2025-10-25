from app.extensions import db
from datetime import datetime

class Users(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False) # [cite: 1]
    password_hash = db.Column(db.String, nullable=False) # [cite: 1]
    username = db.Column(db.String) # [cite: 1]
    enrollment_date = db.Column(db.DateTime, comment="Dùng để tính năm học") # [cite: 1]
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 1]
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 1]

    # Định nghĩa mối quan hệ
    prompts = db.relationship('RoadmapPrompt', back_populates='user', lazy=True) # [cite: 2]
    roadmaps = db.relationship('Roadmap', back_populates='user', lazy=True) # [cite: 6]

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'created_at': self.created_at.isoformat()
        }