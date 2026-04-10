from flask import Blueprint, request, jsonify, session
from models import Post, Comment, User
from extensions import db
from services.ai_service import AIService
import threading

posts_bp = Blueprint('posts', __name__, url_prefix='/api/posts')

def trigger_ai_response(app, post_id, title, content):
    with app.app_context():
        # Get AI User (Create if not exists)
        ai_user = User.query.filter_by(username='AI助手').first()
        if not ai_user:
            ai_user = User(username='AI助手')
            ai_user.set_password('system_ai_pwd')
            db.session.add(ai_user)
            db.session.commit()

        answer = AIService.generate_answer(title, content)
        
        comment = Comment(
            content=answer,
            is_ai=True,
            post_id=post_id,
            user_id=ai_user.id
        )
        db.session.add(comment)
        db.session.commit()

@posts_bp.route('', methods=['GET'])
def list_posts():
    tag = request.args.get('tag')
    user_id = request.args.get('user_id')
    
    query = Post.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
        
    query = query.order_by(Post.created_at.desc())
    posts = query.all()
    
    if tag and tag != 'all':
        posts = [p for p in posts if tag.lower() in [t.lower() for t in p.tags]]

    return jsonify({'code': 200, 'data': [p.to_dict() for p in posts]})

@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    data = post.to_dict()
    # Add comments
    data['comments'] = [c.to_dict() for c in post.comments]
    return jsonify({'code': 200, 'data': data})

@posts_bp.route('', methods=['POST'])
def create_post():
    if 'user_id' not in session:
        return jsonify({'code': 401, 'message': 'Unauthorized'}), 401

    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    tags_str = data.get('tags', '')
    tags = [t.strip() for t in tags_str.split(',') if t.strip()]

    post = Post(
        title=title,
        content=content,
        tags=tags,
        user_id=session['user_id']
    )
    db.session.add(post)
    db.session.commit()

    # Trigger Async AI
    from flask import current_app
    app = current_app._get_current_object() # Get real app object for thread
    thread = threading.Thread(target=trigger_ai_response, args=(app, post.id, title, content))
    thread.start()

    return jsonify({'code': 201, 'message': 'Post created', 'data': post.to_dict()})
@posts_bp.route('/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.likes = (post.likes or 0) + 1
    db.session.commit()
    return jsonify({'code': 200, 'message': 'Liked', 'likes': post.likes})
    return jsonify({'code': 200, 'message': 'Liked', 'likes': post.likes})

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    if 'user_id' not in session:
        return jsonify({'code': 401, 'message': 'Unauthorized'}), 401
    
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != session['user_id']:
        return jsonify({'code': 403, 'message': 'Permission denied'}), 403
        
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'code': 200, 'message': 'Deleted successfully'})
