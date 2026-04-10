from extensions import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_ai = db.Column(db.Boolean, default=False)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    def to_dict(self):
        author_name = "AI 智能助手" if self.is_ai else (self.author.username if self.author else "Unknown")
        return {
            'id': self.id,
            'content': self.content,
            'is_ai': self.is_ai,
            'likes': self.likes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'author': author_name,
            'user_id': self.user_id
        }
