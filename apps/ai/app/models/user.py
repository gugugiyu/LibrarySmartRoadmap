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
            # Đây là to_dict đầy đủ (bạn có thể đổi tên thành to_dict_full nếu muốn)
            return {
                'user_id': self.id,
                'email': self.email,
                'username': self.username,
                'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
                'created_at': self.created_at.isoformat(),
                # Cẩn thận: Nếu gọi to_dict() ở đây, nó sẽ gây lặp vô hạn
                'prompts': [p.to_dict_simple() for p in self.prompts],
                'roadmaps': [r.to_dict_simple() for r in self.roadmaps]
            }

    def to_dict_simple(self):
        # Phiên bản đơn giản, CHỈ chứa các trường của user
        # KHÔNG bao gồm 'prompts' hoặc 'roadmaps'
        return {
            'user_id': self.id,
            'email': self.email,
            'username': self.username
        }