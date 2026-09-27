from tests.conftest import auth_headers

CAMPAIGN_PAYLOAD = {
    "name": "Campanha Calendário",
    "channel": "TikTok",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "budget": 2000,
    "goal": "Testar publicações",
    "status": "planejada",
}


def test_create_and_filter_publications_by_month(app, client):
    headers = auth_headers(app, client)
    campaign = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()

    client.post(
        "/api/publications",
        json={
            "campaignId": campaign["id"],
            "title": "Post de janeiro",
            "description": "Lançamento",
            "date": "2026-01-08",
        },
        headers=headers,
    )
    client.post(
        "/api/publications",
        json={
            "campaignId": campaign["id"],
            "title": "Post de fevereiro",
            "description": "Follow-up",
            "date": "2026-02-03",
        },
        headers=headers,
    )

    january = client.get("/api/publications/month/2026/1", headers=headers).get_json()
    assert len(january) == 1
    assert january[0]["title"] == "Post de janeiro"


def test_update_publication(app, client):
    headers = auth_headers(app, client)
    campaign = client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()

    created = client.post(
        "/api/publications",
        json={
            "campaignId": campaign["id"],
            "title": "Rascunho",
            "description": "",
            "date": "2026-01-08",
        },
        headers=headers,
    ).get_json()

    updated = client.put(
        f"/api/publications/{created['id']}", json={"title": "Publicado"}, headers=headers
    ).get_json()

    assert updated["title"] == "Publicado"
    assert updated["campaignId"] == campaign["id"]
