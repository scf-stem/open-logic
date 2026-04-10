import os
from flask import Flask, render_template, request, redirect, make_response
from dotenv import load_dotenv

load_dotenv() # Load .env file

from config import DevelopmentConfig, ProductionConfig
from extensions import db, migrate, cors
from routes import auth_bp, posts_bp, comments_bp, runner_bp, courses_bp
from translations import SUPPORTED_UI_LOCALES, get_messages, translate

def create_app(config_class=None):
    if config_class is None:
        config_name = os.environ.get('FLASK_CONFIG', 'production').lower()
        config_class = ProductionConfig if config_name == 'production' else DevelopmentConfig

    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validate()

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(runner_bp)
    app.register_blueprint(courses_bp)

    def resolve_ui_locale():
        locale = request.cookies.get('ui_locale', 'en')
        if locale not in SUPPORTED_UI_LOCALES:
            locale = 'en'
        return locale

    @app.context_processor
    def inject_i18n():
        ui_locale = resolve_ui_locale()
        alternate_ui_locale = 'zh' if ui_locale == 'en' else 'en'

        def t(key, default=None, **kwargs):
            return translate(ui_locale, key, default=default, **kwargs)

        return {
            't': t,
            'ui_locale': ui_locale,
            'alternate_ui_locale': alternate_ui_locale,
            'ui_messages': get_messages(ui_locale),
        }

    @app.route('/set-ui-locale/<locale>')
    def set_ui_locale(locale):
        target_locale = locale if locale in SUPPORTED_UI_LOCALES else 'en'
        next_url = request.args.get('next') or '/'
        if not next_url.startswith('/'):
            next_url = '/'

        response = make_response(redirect(next_url))
        response.set_cookie('ui_locale', target_locale, max_age=60 * 60 * 24 * 365, samesite='Lax')
        return response

    # Frontend Routes (Serving Templates)
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/login')
    def login_page():
        return render_template('login.html')
        
    @app.route('/register')
    def register_page():
        return render_template('register.html')

    @app.route('/create')
    def create_post_page():
        return render_template('post_create.html')

    @app.route('/guidelines')
    def guidelines_page():
        return render_template('guidelines.html')

    @app.route('/about')
    def about_page():
        return render_template('about.html')

    @app.route('/profile')
    def profile_page():
        return render_template('profile.html')

    @app.route('/post/<int:post_id>')
    def post_detail(post_id):
        return render_template('post_detail.html')

    return app

app = create_app()

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 8080))
    except ValueError:
        port = 8080 # Fallback if PORT is not an integer (e.g. "${WEB_PORT}")
        
    print(f"Starting Open Logic Server at http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port)
