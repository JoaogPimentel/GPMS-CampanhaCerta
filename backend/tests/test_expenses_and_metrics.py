from tests.conftest import auth_headers

CAMPAIGN_PAYLOAD = {
    "name": "Campanha Financeira",
    "channel": "Google Ads",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "budget": 5000,
    "goal": "Testar gastos e métricas",
    "status": "planejada",
    "conversionValue": 80,
}


def _create_campaign(client, headers):
    return client.post("/api/campaigns", json=CAMPAIGN_PAYLOAD, headers=headers).get_json()


def test_register_expense_and_list_by_campaign(app, client):
    headers = auth_headers(app, client)
    campaign = _create_campaign(client, headers)

    response = client.post(
        f"/api/campaigns/{campaign['id']}/expenses",
        json={"description": "Anúncios", "amount": 300, "date": "2026-01-05"},
        headers=headers,
    )
    assert response.status_code == 201

    listing = client.get(f"/api/campaigns/{campaign['id']}/expenses", headers=headers).get_json()
    assert len(listing) == 1
    assert listing[0]["campaignId"] == campaign["id"]


def test_register_metric_manually(app, client):
    headers = auth_headers(app, client)
    campaign = _create_campaign(client, headers)

    response = client.post(
        f"/api/campaigns/{campaign['id']}/metrics",
        json={"date": "2026-01-07", "reach": 1000, "clicks": 80, "conversions": 10},
        headers=headers,
    )
    assert response.status_code == 201
    assert response.get_json()["reach"] == 1000


def test_import_metrics_csv_reports_errors_without_discarding_valid_rows(app, client):
    headers = auth_headers(app, client)
    campaign = _create_campaign(client, headers)

    csv_text = (
        "date,reach,clicks,conversions\n"
        "2026-01-07,1000,80,10\n"
        "2026-01-08,,50,5\n"
        "2026-01-09,1200,90,abc\n"
    )

    response = client.post(
        f"/api/campaigns/{campaign['id']}/metrics/import-csv",
        data=csv_text,
        content_type="text/csv",
        headers=headers,
    )

    body = response.get_json()
    assert body["imported"] == 1
    assert len(body["errors"]) == 2

    listing = client.get(f"/api/campaigns/{campaign['id']}/metrics", headers=headers).get_json()
    assert len(listing) == 1


def _import_csv(client, headers, campaign_id, data):
    return client.post(
        f"/api/campaigns/{campaign_id}/metrics/import-csv",
        data=data,
        content_type="text/csv",
        headers=headers,
    ).get_json()


def test_import_metrics_csv_accepts_excel_utf8_bom(app, client):
    # "CSV UTF-8" do Excel: BOM no início e quebras de linha CRLF.
    headers = auth_headers(app, client)
    campaign = _create_campaign(client, headers)

    data = "﻿date,reach,clicks,conversions\r\n2026-01-07,1000,80,10\r\n2026-01-08,900,70,8\r\n"

    body = _import_csv(client, headers, campaign["id"], data.encode("utf-8"))

    assert body == {"imported": 2, "errors": []}


def test_import_metrics_csv_accepts_semicolon_separator(app, client):
    # Excel em português salva CSV separado por ";".
    headers = auth_headers(app, client)
    campaign = _create_campaign(client, headers)

    data = "date;reach;clicks;conversions\n2026-01-07;1000;80;10\n"

    body = _import_csv(client, headers, campaign["id"], data)

    assert body == {"imported": 1, "errors": []}
    listing = client.get(f"/api/campaigns/{campaign['id']}/metrics", headers=headers).get_json()
    assert listing[0]["reach"] == 1000
