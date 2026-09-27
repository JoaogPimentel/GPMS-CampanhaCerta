from tests.conftest import admin_headers, auth_headers

CAMPAIGN_PAYLOAD = {
    "name": "Campanha de Teste",
    "channel": "Instagram",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "budget": 1000,
    "goal": "Testar API",
    "status": "planejada",
    "conversionValue": 50,
    "targetAudience": {"ageRange": "18-24", "region": "Sudeste", "interest": "Games"},
}


def test_list_campaigns_requires_auth(client):
    response = client.get("/api/campaigns")
    assert response.status_code == 401


def test_create_and_get_campaign_round_trips_target_audience(app, client):
    headers = auth_headers(app, client)

    created = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()
    assert created["targetAudience"] == CAMPAIGN_PAYLOAD["targetAudience"]

    fetched = client.get(f"/api/campaigns/{created['id']}", headers=headers).get_json()
    assert fetched["name"] == "Campanha de Teste"


def test_update_campaign_merges_fields(app, client):
    headers = auth_headers(app, client)
    created = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()

    updated = client.put(
        f"/api/campaigns/{created['id']}", json={"status": "em_andamento"}, headers=headers
    ).get_json()

    assert updated["status"] == "em_andamento"
    assert updated["name"] == "Campanha de Teste"


def test_analista_cannot_delete_campaign(app, client):
    headers = auth_headers(app, client)
    created = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()

    response = client.delete(f"/api/campaigns/{created['id']}", headers=headers)

    assert response.status_code == 403


def test_admin_can_delete_campaign(app, client):
    analista = auth_headers(app, client)
    created = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=analista).get_json()

    admin = admin_headers(app, client)
    response = client.delete(f"/api/campaigns/{created['id']}", headers=admin)
    assert response.status_code == 204

    follow_up = client.get(f"/api/campaigns/{created['id']}", headers=admin)
    assert follow_up.get_json() is None
