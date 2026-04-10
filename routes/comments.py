from flask import Blueprint, request, jsonify, session
from models import Comment, Post
from extensions import db

comments_bp = Blueprint('comments', __name__, url_prefix='/api')

@comments_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    if 'user_id' not in session:
        return jsonify({'code': 401, 'message': 'Unauthorized'}), 401
        
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'code': 400, 'message': 'Content required'}), 400
        
    # Check if post exists
    Post.query.get_or_404(post_id)
    
    comment = Comment(
        content=content,
        post_id=post_id,
        user_id=session['user_id']
    )
    db.session.add(comment)
    db.session.commit()
    
    # Check for AI Mention
    if '@AI' in content.upper() or '@源问AI' in content:
        from services.ai_service import AIService
        from flask import current_app
        import threading
        
        app = current_app._get_current_object()
        # Pass the comment content as context
        thread = threading.Thread(target=AIService.trigger_ai_reply, args=(app, post_id, content))
        thread.start()
    
    return jsonify({'code': 201, 'message': 'Comment created', 'data': comment.to_dict()})
