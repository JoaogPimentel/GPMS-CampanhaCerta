import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import User


class TestConfig:
    SECRET_KEY = "test-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXP_HOURS = 12
    CORS_ORIGINS = ["http://localhost:5173"]


@pytest.fixture()
def app():
    application = create_app(TestConfig)
    yield application
    with application.app_context():
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _create_user_and_login(app, client, *, email, password, role, name):
    with app.app_context():
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

    response = client.post("/api/auth/login", json={"email": email, "password": password})
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def auth_headers(app, client, email="analista@campanhacerta.com", password="senha123"):
    return _create_user_and_login(app, client, email=email, password=password, role="analista", name="Analista")


def admin_headers(app, client, email="admin@campanhacerta.com", password="admin123"):
    return _create_user_and_login(app, client, email=email, password=password, role="admin", name="Admin")
