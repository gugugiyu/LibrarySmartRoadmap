from app.extensions import db
from datetime import datetime

class Roadmap(db.Model):
    __tablename__ = 'roadmap'

    roadmap_id = db.Column(db.Integer, primary_key=True) # [cite: 6]
    prompt_id = db.Column(db.Integer, db.ForeignKey('roadmap_prompt.prompt_id'), nullable=False, comment="Roadmap này được tạo từ prompt nào") # [cite: 6]
    id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment="Roadmap này thuộc user nào") # [cite: 6]
    title = db.Column(db.String, comment="Tiêu đề của roadmap") # [cite: 6]
    description = db.Column(db.Text) # [cite: 6]
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 6]
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 6]

    # Mối quan hệ
    user = db.relationship('Users', back_populates='roadmaps')
    prompt = db.relationship('RoadmapPrompt', back_populates='generated_roadmaps')
    nodes = db.relationship('RoadmapNode', back_populates='roadmap', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'roadmap_id': self.roadmap_id,
            'prompt_id': self.prompt_id,
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }