from flask import Blueprint, jsonify, request

from ..auth import login_required
from ..extensions import db
from ..models import Expense

bp = Blueprint("expenses", __name__, url_prefix="/api/campaigns/<int:campaign_id>/expenses")


@bp.get("")
@login_required
def list_expenses(campaign_id):
    expenses = Expense.query.filter_by(campaign_id=campaign_id).order_by(Expense.id).all()
    return jsonify([e.to_dict() for e in expenses])


@bp.post("")
@login_required
def create_expense(campaign_id):
    data = request.get_json(silent=True) or {}
    expense = Expense(
        campaign_id=campaign_id,
        description=data.get("description", ""),
        amount=float(data.get("amount") or 0),
        date=data.get("date", ""),
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201
