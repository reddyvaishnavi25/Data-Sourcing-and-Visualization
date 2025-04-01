from app import db
from datetime import datetime
import json

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    filter_params = db.Column(db.Text, nullable=False)  # JSON string with filter parameters
    
    # Relationship to data records
    data_records = db.relationship('DataRecord', backref='task', lazy=True)
    
    def __init__(self, name, filter_params):
        self.name = name
        self.filter_params = json.dumps(filter_params) if isinstance(filter_params, dict) else filter_params
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'filter_params': json.loads(self.filter_params) if self.filter_params else {}
        } 