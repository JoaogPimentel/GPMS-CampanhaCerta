from tests.conftest import admin_headers, auth_headers


def test_login_rejects_wrong_password(app, client):
    auth_headers(app, client, email="login@campanhacerta.com", password="correta123")

    response = client.post(
        "/api/auth/login", json={"email": "login@campanhacerta.com", "password": "errada"}
    )

    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user_with_valid_token(app, client):
    headers = auth_headers(app, client)
    response = client.get("/api/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.get_json()["user"]["email"] == "analista@campanhacerta.com"


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/api/auth/login", json={"email": "ninguem@campanhacerta.com", "password": "qualquer"}
    )
    assert response.status_code == 401


def test_create_user_requires_auth(client):
    response = client.post(
        "/api/auth/users",
        json={"name": "Novo", "email": "novo@campanhacerta.com", "password": "senha123"},
    )
    assert response.status_code == 401


def test_analista_cannot_create_user(app, client):
    headers = auth_headers(app, client)

    response = client.post(
        "/api/auth/users",
        json={"name": "Novo", "email": "novo@campanhacerta.com", "password": "senha123"},
        headers=headers,
    )

    assert response.status_code == 403


def test_admin_creates_user_with_default_role(app, client):
    headers = admin_headers(app, client)

    response = client.post(
        "/api/auth/users",
        json={"name": "Novo Analista", "email": "novo-analista@campanhacerta.com", "password": "senha123"},
        headers=headers,
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["user"]["role"] == "analista"
    assert "password" not in body["user"]
    assert "token" not in body


def test_admin_creates_user_with_admin_role(app, client):
    headers = admin_headers(app, client)

    response = client.post(
        "/api/auth/users",
        json={
            "name": "Novo Admin",
            "email": "novo-admin@campanhacerta.com",
            "password": "senha123",
            "role": "admin",
        },
        headers=headers,
    )

    assert response.status_code == 201
    assert response.get_json()["user"]["role"] == "admin"


def test_create_user_rejects_duplicate_email(app, client):
    headers = admin_headers(app, client)
    payload = {"name": "Dup", "email": "dup@campanhacerta.com", "password": "senha123"}

    client.post("/api/auth/users", json=payload, headers=headers)
    response = client.post("/api/auth/users", json=payload, headers=headers)

    assert response.status_code == 409


def test_create_user_rejects_invalid_role(app, client):
    headers = admin_headers(app, client)

    response = client.post(
        "/api/auth/users",
        json={
            "name": "Papel inválido",
            "email": "invalido@campanhacerta.com",
            "password": "senha123",
            "role": "superadmin",
        },
        headers=headers,
    )

    assert response.status_code == 400
