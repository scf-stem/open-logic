from extensions import db
from datetime import datetime
import json

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    _tags = db.Column('tags', db.String(200), default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan")

    @property
    def tags(self):
        return json.loads(self._tags)

    @tags.setter
    def tags(self, value):
        self._tags = json.dumps(value)

    def to_dict(self):
        # Check has_ai status from comments
        has_ai = any(c.is_ai for c in self.comments)
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'tags': self.tags,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'author': self.author.username,
            'user_id': self.user_id,
            'comments_count': len(self.comments),
            'has_ai': has_ai,
            'likes': self.likes
        }
