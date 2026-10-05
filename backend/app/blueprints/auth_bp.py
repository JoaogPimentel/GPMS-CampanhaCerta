from flask import Blueprint, g, jsonify, request

from ..auth import admin_required, generate_token, login_required
from ..extensions import db
from ..models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

VALID_ROLES = {"admin", "analista"}


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Credenciais inválidas"}), 401

    return jsonify({"user": user.to_dict(), "token": generate_token(user)})


@bp.get("/me")
@login_required
def me():
    return jsonify({"user": g.current_user.to_dict()})


@bp.post("/users")
@admin_required
def create_user():
    """Cria um usuário. Restrito a administradores (RF01/RF09)."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role") or "analista"

    if not name or not email or not password:
        return jsonify({"error": "Nome, e-mail e senha são obrigatórios"}), 400

    if role not in VALID_ROLES:
        return jsonify({"error": "Perfil inválido"}), 400

    if User.query.filter_by(email=email).first() is not None:
        return jsonify({"error": "E-mail já cadastrado"}), 409

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 201
