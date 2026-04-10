import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @staticmethod
    def validate():
        """Allow env-specific configs to enforce required settings."""
        return None

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = Config.SECRET_KEY or 'dev-secret-key-change-in-production'
    # Default to local sqlite for dev
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///openlogic.db'

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

    @staticmethod
    def validate():
        missing = []
        if not ProductionConfig.SECRET_KEY:
            missing.append('SECRET_KEY')
        if not ProductionConfig.SQLALCHEMY_DATABASE_URI:
            missing.append('DATABASE_URL')
        if missing:
            raise RuntimeError(
                f"Missing required production environment variables: {', '.join(missing)}"
            )
