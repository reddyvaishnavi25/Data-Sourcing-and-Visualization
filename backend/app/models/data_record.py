from app import db
from datetime import datetime

class DataRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    source = db.Column(db.String(50), nullable=False)  # e.g., "source_a" or "source_b"
    category = db.Column(db.String(100))
    brand = db.Column(db.String(100))
    price = db.Column(db.Float)
    purchase_date = db.Column(db.DateTime)
    quantity = db.Column(db.Integer, default=1)
    rating = db.Column(db.Float, nullable=True)
    platform = db.Column(db.String(50))
    location = db.Column(db.String(100), nullable=True)
    payment_method = db.Column(db.String(50), nullable=True)
    product_id = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, task_id, source, category=None, brand=None, price=None, 
                 purchase_date=None, quantity=1, rating=None, platform=None, 
                 location=None, payment_method=None, product_id=None):
        self.task_id = task_id
        self.source = source
        self.category = category
        self.brand = brand
        self.price = price
        self.purchase_date = purchase_date
        self.quantity = quantity
        self.rating = rating
        self.platform = platform
        self.location = location
        self.payment_method = payment_method
        self.product_id = product_id
        
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'source': self.source,
            'category': self.category,
            'brand': self.brand,
            'price': self.price,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'quantity': self.quantity,
            'rating': self.rating,
            'platform': self.platform,
            'location': self.location,
            'payment_method': self.payment_method,
            'product_id': self.product_id,
            'created_at': self.created_at.isoformat()
        } 