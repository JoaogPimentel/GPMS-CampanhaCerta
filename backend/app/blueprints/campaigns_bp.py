from flask import Blueprint, jsonify, request

from ..auth import admin_required, login_required
from ..extensions import db
from ..models import Campaign

bp = Blueprint("campaigns", __name__, url_prefix="/api/campaigns")


@bp.get("")
@login_required
def list_campaigns():
    campaigns = Campaign.query.order_by(Campaign.id).all()
    return jsonify([c.to_dict() for c in campaigns])


@bp.get("/<int:campaign_id>")
@login_required
def get_campaign(campaign_id):
    campaign = db.session.get(Campaign, campaign_id)
    if campaign is None:
        return jsonify(None)
    return jsonify(campaign.to_dict())


@bp.post("")
@login_required
def create_campaign():
    data = request.get_json(silent=True) or {}
    campaign = Campaign(
        name=data.get("name", ""),
        channel=data.get("channel", ""),
        start_date=data.get("startDate", ""),
        end_date=data.get("endDate", ""),
        budget=float(data.get("budget") or 0),
        goal=data.get("goal", ""),
        status=data.get("status", "planejada"),
        conversion_value=float(data.get("conversionValue") or 0),
    )
    audience = data.get("targetAudience") or {}
    campaign.target_age_range = audience.get("ageRange")
    campaign.target_region = audience.get("region")
    campaign.target_interest = audience.get("interest")

    db.session.add(campaign)
    db.session.commit()
    return jsonify(campaign.to_dict()), 201


@bp.route("/<int:campaign_id>", methods=["PUT", "PATCH"])
@login_required
def update_campaign(campaign_id):
    campaign = db.session.get(Campaign, campaign_id)
    if campaign is None:
        return jsonify({"error": "Campanha não encontrada"}), 404

    data = request.get_json(silent=True) or {}
    campaign.apply_updates(data)
    db.session.commit()
    return jsonify(campaign.to_dict())


@bp.delete("/<int:campaign_id>")
@admin_required
def delete_campaign(campaign_id):
    campaign = db.session.get(Campaign, campaign_id)
    if campaign is not None:
        db.session.delete(campaign)
        db.session.commit()
    return "", 204
