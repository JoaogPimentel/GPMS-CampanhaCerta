import os

from flask import Flask
from flask_cors import CORS

from .extensions import db


def create_app(config_object="config.Config"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    os.makedirs(os.path.join(app.root_path, "..", "instance"), exist_ok=True)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    from .blueprints import auth_bp, campaigns_bp, expenses_bp, metrics_bp, publications_bp

    app.register_blueprint(auth_bp.bp)
    app.register_blueprint(campaigns_bp.bp)
    app.register_blueprint(expenses_bp.bp)
    app.register_blueprint(metrics_bp.bp)
    app.register_blueprint(publications_bp.bp)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    with app.app_context():
        db.create_all()

    from . import seed

    app.cli.add_command(seed.seed_command)

    return app
