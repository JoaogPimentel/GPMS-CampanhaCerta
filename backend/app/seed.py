import click
from flask.cli import with_appcontext

from .extensions import db
from .models import Campaign, Expense, Metric, Publication, User


@click.command("seed")
@with_appcontext
def seed_command():
    """Popula o banco com os mesmos dados fake usados no piloto de frontend."""
    if User.query.first() is not None:
        click.echo("Banco já tem dados, nada foi alterado.")
        return

    admin = User(name="Administrador", email="admin@campanhacerta.com", role="admin")
    admin.set_password("admin123")

    analista = User(name="Analista", email="analista@campanhacerta.com", role="analista")
    analista.set_password("analista123")

    db.session.add_all([admin, analista])

    launch = Campaign(
        name="Campanha de Lançamento",
        channel="Instagram",
        start_date="2026-01-01",
        end_date="2026-01-31",
        budget=5000,
        goal="Apresentar o novo produto ao mercado",
        status="em_andamento",
        conversion_value=80,
        target_age_range="25-34",
        target_region="Sudeste",
        target_interest="Tecnologia",
    )
    loyalty = Campaign(
        name="Campanha de Fidelização",
        channel="E-mail",
        start_date="2026-02-01",
        end_date="2026-02-28",
        budget=1500,
        goal="Aumentar recompra de clientes atuais",
        status="planejada",
        conversion_value=40,
        target_age_range="35-44",
        target_region="Sul",
        target_interest="Moda",
    )
    db.session.add_all([launch, loyalty])
    db.session.flush()

    db.session.add_all(
        [
            Expense(campaign_id=launch.id, description="Anúncios patrocinados", amount=3000, date="2026-01-05"),
            Expense(campaign_id=launch.id, description="Produção de criativos", amount=1200, date="2026-01-10"),
        ]
    )
    db.session.add_all(
        [
            Metric(campaign_id=launch.id, date="2026-01-07", reach=2000, clicks=150, conversions=20),
            Metric(campaign_id=launch.id, date="2026-01-14", reach=2500, clicks=190, conversions=25),
        ]
    )
    db.session.add_all(
        [
            Publication(
                campaign_id=launch.id,
                title="Post de lançamento no Instagram",
                description="Anúncio do produto novo",
                date="2026-01-08",
            ),
            Publication(
                campaign_id=launch.id,
                title="Story de bastidores",
                description="Vídeo curto mostrando produção",
                date="2026-01-20",
            ),
        ]
    )

    db.session.commit()
    click.echo("Seed concluído: 2 usuários, 2 campanhas, gastos, métricas e publicações.")
