import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BudgetBar from '../components/BudgetBar'
import ChannelBadge from '../components/ChannelBadge'
import StatusChip from '../components/StatusChip'
import { useAuth } from '../context/AuthContext'
import { deleteCampaign, getCampaigns } from '../services/campaignService'
import { getExpensesByCampaign } from '../services/expenseService'
import { getBudgetStatus } from '../utils/budgetStatus'
import { formatDate } from '../utils/format'

const RISK_ORDER = { over: 0, risk: 1, healthy: 2 }

function CampaignsListPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [rows, setRows] = useState([])
  const [confirmingId, setConfirmingId] = useState(null)

  async function loadCampaigns() {
    const campaigns = await getCampaigns()
    const withSpend = await Promise.all(
      campaigns.map(async (campaign) => {
        const expenses = await getExpensesByCampaign(campaign.id)
        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const risk = getBudgetStatus(spent, campaign.budget).level
        return { campaign, spent, risk }
      }),
    )
    withSpend.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk])
    setRows(withSpend)
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function handleConfirmDelete(id) {
    await deleteCampaign(id)
    setConfirmingId(null)
    await loadCampaigns()
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Campanhas</h1>
          <p className="page-head-sub">
            Ordenadas por risco de orçamento — o que precisa de atenção aparece primeiro.
          </p>
        </div>
        <div className="page-head-actions">
          <Link to="/campanhas/nova" className="btn-primary">
            + Nova campanha
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">
          Você ainda não tem campanhas. Crie a primeira para começar a acompanhar orçamento e
          desempenho.
        </p>
      ) : (
        <div className="campaign-list">
          {rows.map(({ campaign, spent }) => (
            <div className="campaign-card" key={campaign.id}>
              <div className="campaign-card-main">
                <Link to={`/campanhas/${campaign.id}`} className="campaign-card-name">
                  {campaign.name}
                </Link>
                <div className="campaign-card-tags">
                  <ChannelBadge channel={campaign.channel} />
                  <StatusChip status={campaign.status} />
                </div>
                <span className="campaign-card-period">
                  {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                </span>
              </div>

              <BudgetBar spent={spent} budget={campaign.budget} />

              <div className="campaign-card-actions">
                {confirmingId === campaign.id ? (
                  <>
                    <button className="btn-danger" onClick={() => handleConfirmDelete(campaign.id)}>
                      Confirmar exclusão
                    </button>
                    <button onClick={() => setConfirmingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/campanhas/${campaign.id}`}
                      className="link-action"
                      aria-label={`Detalhes de ${campaign.name}`}
                    >
                      Detalhes
                    </Link>
                    <Link
                      to={`/campanhas/${campaign.id}/editar`}
                      className="link-action"
                      aria-label={`Editar ${campaign.name}`}
                    >
                      Editar
                    </Link>
                    {isAdmin && (
                      <button
                        aria-label={`Excluir ${campaign.name}`}
                        onClick={() => setConfirmingId(campaign.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default CampaignsListPage
