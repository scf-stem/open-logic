from flask import Blueprint, request, jsonify, session, Response
from models import User
from extensions import db
import random
import string
from captcha.image import ImageCaptcha
import io

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/captcha')
def get_captcha():
    image = ImageCaptcha(width=120, height=40)
    # Generate 4 random letters/digits
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    session['captcha'] = code.lower()
    
    data = image.generate(code)
    return Response(data, mimetype='image/png')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    captcha = data.get('captcha', '').lower()
    
    # 1. Verify Captcha
    if not captcha or captcha != session.get('captcha', ''):
        return jsonify({'code': 400, 'message': '验证码错误'}), 400

    if not username or not password:
        return jsonify({'code': 400, 'message': '请输入用户名和密码'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'code': 400, 'message': '用户名已存在'}), 400
        
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    # Clear captcha after success
    session.pop('captcha', None)
    
    return jsonify({'code': 200, 'message': '注册成功'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'code': 401, 'message': '用户不存在'}), 401
    
    if not user.check_password(password):
        return jsonify({'code': 401, 'message': '密码错误'}), 401

    session['user_id'] = user.id
    return jsonify({'code': 200, 'message': '登录成功', 'data': user.to_dict()})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'code': 200, 'message': 'Logged out'})

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'code': 401, 'message': 'Not logged in'}), 401
    
    user = User.query.get(user_id)
    return jsonify({'code': 200, 'data': user.to_dict()})
