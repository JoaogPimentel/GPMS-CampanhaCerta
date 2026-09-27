from flask import Blueprint, jsonify, request

from ..auth import login_required
from ..extensions import db
from ..models import Publication

bp = Blueprint("publications", __name__, url_prefix="/api/publications")


@bp.get("")
@login_required
def list_publications():
    publications = Publication.query.order_by(Publication.id).all()
    return jsonify([p.to_dict() for p in publications])


@bp.get("/month/<int:year>/<int:month>")
@login_required
def list_by_month(year, month):
    prefix = f"{year:04d}-{month:02d}"
    publications = (
        Publication.query.filter(Publication.date.startswith(prefix)).order_by(Publication.id).all()
    )
    return jsonify([p.to_dict() for p in publications])


@bp.get("/<int:publication_id>")
@login_required
def get_publication(publication_id):
    publication = db.session.get(Publication, publication_id)
    if publication is None:
        return jsonify(None)
    return jsonify(publication.to_dict())


@bp.post("")
@login_required
def create_publication():
    data = request.get_json(silent=True) or {}
    publication = Publication(
        campaign_id=int(data.get("campaignId")),
        title=data.get("title", ""),
        description=data.get("description", ""),
        date=data.get("date", ""),
    )
    db.session.add(publication)
    db.session.commit()
    return jsonify(publication.to_dict()), 201


@bp.route("/<int:publication_id>", methods=["PUT", "PATCH"])
@login_required
def update_publication(publication_id):
    publication = db.session.get(Publication, publication_id)
    if publication is None:
        return jsonify({"error": "Publicação não encontrada"}), 404

    data = request.get_json(silent=True) or {}
    publication.apply_updates(data)
    db.session.commit()
    return jsonify(publication.to_dict())
