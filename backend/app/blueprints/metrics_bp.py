from flask import Blueprint, jsonify, request

from ..auth import login_required
from ..csv_metrics import parse_metrics_csv
from ..extensions import db
from ..models import Metric

bp = Blueprint("metrics", __name__, url_prefix="/api/campaigns/<int:campaign_id>/metrics")


@bp.get("")
@login_required
def list_metrics(campaign_id):
    metrics = Metric.query.filter_by(campaign_id=campaign_id).order_by(Metric.id).all()
    return jsonify([m.to_dict() for m in metrics])


@bp.post("")
@login_required
def create_metric(campaign_id):
    data = request.get_json(silent=True) or {}
    metric = Metric(
        campaign_id=campaign_id,
        date=data.get("date", ""),
        reach=int(data.get("reach") or 0),
        clicks=int(data.get("clicks") or 0),
        conversions=int(data.get("conversions") or 0),
    )
    db.session.add(metric)
    db.session.commit()
    return jsonify(metric.to_dict()), 201


@bp.post("/import-csv")
@login_required
def import_metrics_csv(campaign_id):
    csv_text = request.get_data(as_text=True)
    parsed, errors = parse_metrics_csv(csv_text)

    for row in parsed:
        db.session.add(Metric(campaign_id=campaign_id, **row))
    db.session.commit()

    return jsonify({"imported": len(parsed), "errors": errors})
