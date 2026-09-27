from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="analista")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "role": self.role}


class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(180), nullable=False)
    channel = db.Column(db.String(60), nullable=False)
    start_date = db.Column(db.String(10), nullable=False)
    end_date = db.Column(db.String(10), nullable=False)
    budget = db.Column(db.Float, nullable=False, default=0)
    goal = db.Column(db.Text, nullable=True, default="")
    status = db.Column(db.String(30), nullable=False, default="planejada")
    conversion_value = db.Column(db.Float, nullable=False, default=0)
    target_age_range = db.Column(db.String(20), nullable=True)
    target_region = db.Column(db.String(80), nullable=True)
    target_interest = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    expenses = db.relationship("Expense", backref="campaign", cascade="all, delete-orphan")
    metrics = db.relationship("Metric", backref="campaign", cascade="all, delete-orphan")
    publications = db.relationship("Publication", backref="campaign", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "channel": self.channel,
            "startDate": self.start_date,
            "endDate": self.end_date,
            "budget": self.budget,
            "goal": self.goal,
            "status": self.status,
            "conversionValue": self.conversion_value,
            "targetAudience": {
                "ageRange": self.target_age_range,
                "region": self.target_region,
                "interest": self.target_interest,
            },
        }

    def apply_updates(self, data):
        simple_fields = {
            "name": "name",
            "channel": "channel",
            "startDate": "start_date",
            "endDate": "end_date",
            "budget": "budget",
            "goal": "goal",
            "status": "status",
            "conversionValue": "conversion_value",
        }
        for key, attr in simple_fields.items():
            if key in data:
                setattr(self, attr, data[key])

        if "targetAudience" in data and data["targetAudience"] is not None:
            audience = data["targetAudience"]
            self.target_age_range = audience.get("ageRange", self.target_age_range)
            self.target_region = audience.get("region", self.target_region)
            self.target_interest = audience.get("interest", self.target_interest)


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id"), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "campaignId": self.campaign_id,
            "description": self.description,
            "amount": self.amount,
            "date": self.date,
        }


class Metric(db.Model):
    __tablename__ = "metrics"

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id"), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    reach = db.Column(db.Integer, nullable=False, default=0)
    clicks = db.Column(db.Integer, nullable=False, default=0)
    conversions = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "campaignId": self.campaign_id,
            "date": self.date,
            "reach": self.reach,
            "clicks": self.clicks,
            "conversions": self.conversions,
        }


class Publication(db.Model):
    __tablename__ = "publications"

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaigns.id"), nullable=False)
    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, nullable=True, default="")
    date = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "campaignId": self.campaign_id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
        }

    def apply_updates(self, data):
        simple_fields = {"title": "title", "description": "description", "date": "date"}
        for key, attr in simple_fields.items():
            if key in data:
                setattr(self, attr, data[key])
        if "campaignId" in data:
            self.campaign_id = int(data["campaignId"])
