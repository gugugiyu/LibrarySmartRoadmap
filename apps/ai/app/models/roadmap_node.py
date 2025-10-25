from app.extensions import db
from datetime import datetime

class RoadmapNode(db.Model):
    __tablename__ = 'roadmap_node'

    node_id = db.Column(db.Integer, primary_key=True) # 
    roadmap_id = db.Column(db.Integer, db.ForeignKey('roadmap.roadmap_id'), nullable=False, comment="Node này thuộc roadmap nào") # 
    parent_node_id = db.Column(db.Integer, db.ForeignKey('roadmap_node.node_id'), nullable=True, comment="Tự tham chiếu để tạo cây") # 
    info_id = db.Column(db.Integer, db.ForeignKey('textual_information.id'), nullable=True, comment="Nội dung của node (trỏ tới Book hoặc Article)") # 
    node_order = db.Column(db.Integer, default=0, comment="Thứ tự của node trong cùng 1 cấp") # 
    is_completed = db.Column(db.Boolean, default=False) # 
    deleted_at = db.Column(db.DateTime, nullable=True, comment="Dùng cho soft-deletion (NULL = chưa xóa)") # 
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # [cite: 8]
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # [cite: 8]

    # Mối quan hệ
    roadmap = db.relationship('Roadmap', back_populates='nodes')
    content = db.relationship('TextualInformation', back_populates='roadmap_nodes')
    
    # Mối quan hệ tự tham chiếu (parent/children)
    children = db.relationship('RoadmapNode',
                               backref=db.backref('parent', remote_side=[node_id]),
                               lazy='dynamic',
                               cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'node_id': self.node_id,
            'roadmap_id': self.roadmap_id,
            'parent_node_id': self.parent_node_id,
            'info_id': self.info_id,
            'node_order': self.node_order,
            'is_completed': self.is_completed,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
            'children': [child.to_dict() for child in self.children] # Đệ quy nếu cần
        }