import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BudgetBar from '../components/BudgetBar'
import ChannelBadge from '../components/ChannelBadge'
import StatusChip from '../components/StatusChip'
import { getCampaigns } from '../services/campaignService'
import { getExpensesByCampaign } from '../services/expenseService'
import { getMetricsByCampaign } from '../services/metricService'
import { getBudgetStatus } from '../utils/budgetStatus'
import { computeIndicators } from '../utils/campaignIndicators'
import { formatCurrency } from '../utils/format'

const RISK_ORDER = { over: 0, risk: 1, healthy: 2 }

function DashboardPage() {
  const [rows, setRows] = useState([])

  async function loadDashboard() {
    const campaigns = await getCampaigns()
    const data = await Promise.all(
      campaigns.map(async (campaign) => {
        const [metrics, expenses] = await Promise.all([
          getMetricsByCampaign(campaign.id),
          getExpensesByCampaign(campaign.id),
        ])
        return { campaign, indicators: computeIndicators(campaign, metrics, expenses) }
      }),
    )
    setRows(data)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const totalBudget = rows.reduce((sum, row) => sum + row.campaign.budget, 0)
  const totalSpent = rows.reduce((sum, row) => sum + row.indicators.totalSpent, 0)
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const activeCampaigns = rows.filter((row) => row.campaign.status === 'em_andamento').length

  const attention = rows
    .map((row) => ({
      ...row,
      risk: getBudgetStatus(row.indicators.totalSpent, row.campaign.budget).level,
    }))
    .filter((row) => row.risk !== 'healthy')
    .sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk])

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Visão Geral</h1>
          <p className="page-head-sub">
            Orçamento, ritmo de gasto e desempenho de todas as campanhas.
          </p>
        </div>
        <div className="page-head-actions">
          <Link to="/campanhas/nova" className="btn-primary">
            + Nova campanha
          </Link>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Orçamento total</span>
          <span className="kpi-value">{formatCurrency(totalBudget)}</span>
          <span className="kpi-sub">
            {rows.length} {rows.length === 1 ? 'campanha' : 'campanhas'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Gasto total</span>
          <span className="kpi-value">{formatCurrency(totalSpent)}</span>
          <span className="kpi-sub">{spentPercentage}% do orçamento</span>
          <div className="kpi-meter">
            <div
              className="kpi-meter-fill"
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Campanhas ativas</span>
          <span className="kpi-value">{activeCampaigns}</span>
          <span className="kpi-sub">de {rows.length} no total</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Alertas de orçamento</span>
          <span className={`kpi-value${attention.length > 0 ? ' is-warning' : ' is-success'}`}>
            {attention.length}
          </span>
          <span className="kpi-sub">
            {attention.length > 0 ? 'precisam de atenção' : 'tudo dentro do previsto'}
          </span>
        </div>
      </div>

      {attention.length > 0 && (
        <section>
          <h2>Precisam de atenção</h2>
          <div className="campaign-list">
            {attention.map(({ campaign, indicators }) => (
              <div className="campaign-card" key={campaign.id}>
                <div className="campaign-card-main">
                  <Link to={`/campanhas/${campaign.id}`} className="campaign-card-name">
                    {campaign.name}
                  </Link>
                  <div className="campaign-card-tags">
                    <ChannelBadge channel={campaign.channel} />
                    <StatusChip status={campaign.status} />
                  </div>
                </div>
                <BudgetBar spent={indicators.totalSpent} budget={campaign.budget} />
                <div className="campaign-card-actions">
                  <Link to={`/campanhas/${campaign.id}`} className="link-action">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>Desempenho por campanha</h2>
        {rows.length === 0 ? (
          <p className="empty-state">
            Nenhuma campanha cadastrada ainda. Crie a primeira para ver os indicadores aqui.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Canal</th>
                  <th className="is-numeric">CTR</th>
                  <th className="is-numeric">CPA</th>
                  <th className="is-numeric">ROI simplificado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ campaign, indicators }) => (
                  <tr key={campaign.id}>
                    <td>
                      <Link to={`/campanhas/${campaign.id}`}>{campaign.name}</Link>
                    </td>
                    <td>
                      <ChannelBadge channel={campaign.channel} />
                    </td>
                    <td className="is-numeric">{indicators.ctr.toFixed(2)}%</td>
                    <td className="is-numeric">{indicators.cpa.toFixed(2)}</td>
                    <td className="is-numeric">{indicators.roi.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default DashboardPage
