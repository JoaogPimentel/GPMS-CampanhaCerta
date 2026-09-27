import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BudgetBar from '../components/BudgetBar'
import ChannelBadge from '../components/ChannelBadge'
import StatusChip from '../components/StatusChip'
import { getCampaignById } from '../services/campaignService'
import { createExpense, getExpensesByCampaign } from '../services/expenseService'
import { createMetric, getMetricsByCampaign, importMetricsCsv } from '../services/metricService'
import { computeIndicators } from '../utils/campaignIndicators'
import { buildCampaignReportCsv } from '../utils/campaignReport'
import { downloadCsv } from '../utils/downloadFile'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'

function CampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [metrics, setMetrics] = useState([])
  const [metricDate, setMetricDate] = useState('')
  const [reach, setReach] = useState('')
  const [clicks, setClicks] = useState('')
  const [conversions, setConversions] = useState('')
  const [csvResult, setCsvResult] = useState(null)

  async function loadData() {
    setCampaign(await getCampaignById(id))
    setExpenses(await getExpensesByCampaign(id))
    setMetrics(await getMetricsByCampaign(id))
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    await createExpense({ campaignId: id, description, amount, date })
    setDescription('')
    setAmount('')
    setDate('')
    await loadData()
  }

  async function handleMetricSubmit(event) {
    event.preventDefault()
    await createMetric({ campaignId: id, date: metricDate, reach, clicks, conversions })
    setMetricDate('')
    setReach('')
    setClicks('')
    setConversions('')
    await loadData()
  }

  async function handleCsvUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    const csvText = await file.text()
    const result = await importMetricsCsv(id, csvText)
    setCsvResult(result)
    event.target.value = ''
    await loadData()
  }

  function handleExportCsv() {
    const indicators = computeIndicators(campaign, metrics, expenses)
    const csv = buildCampaignReportCsv({ campaign, indicators })
    downloadCsv(`relatorio-campanha-${campaign.id}.csv`, csv)
  }

  if (!campaign) return null

  const indicators = computeIndicators(campaign, metrics, expenses)
  const totalSpent = indicators.totalSpent
  const isOverBudget = totalSpent > campaign.budget
  const audience = campaign.targetAudience

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{campaign.name}</h1>
          <div className="campaign-card-tags" style={{ marginTop: '10px' }}>
            <ChannelBadge channel={campaign.channel} />
            <StatusChip status={campaign.status} />
          </div>
        </div>
        <div className="page-head-actions">
          <Link to={`/campanhas/${campaign.id}/editar`} className="btn-secondary">
            Editar campanha
          </Link>
          <button className="btn-secondary" onClick={handleExportCsv}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="section-title">Orçamento</h2>
          <BudgetBar spent={totalSpent} budget={campaign.budget} />
          {isOverBudget && (
            <p role="alert" className="alert-banner">
              Orçamento ultrapassado em {formatCurrency(totalSpent - campaign.budget)}
            </p>
          )}

          <div className="metric-tiles">
            <div className="metric-tile">
              <span className="metric-tile-value">{formatNumber(indicators.totalReach)}</span>
              <span className="metric-tile-label">Alcance</span>
            </div>
            <div className="metric-tile">
              <span className="metric-tile-value">{formatNumber(indicators.totalClicks)}</span>
              <span className="metric-tile-label">Cliques</span>
            </div>
            <div className="metric-tile">
              <span className="metric-tile-value">{formatNumber(indicators.totalConversions)}</span>
              <span className="metric-tile-label">Conversões</span>
            </div>
          </div>

          <div className="metric-tiles">
            <div className="metric-tile">
              <span className="metric-tile-value">{indicators.ctr.toFixed(2)}%</span>
              <span className="metric-tile-label">CTR</span>
            </div>
            <div className="metric-tile">
              <span className="metric-tile-value">{indicators.cpa.toFixed(2)}</span>
              <span className="metric-tile-label">CPA</span>
            </div>
            <div className="metric-tile">
              <span className="metric-tile-value">{indicators.roi.toFixed(2)}%</span>
              <span className="metric-tile-label">ROI</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Ficha da campanha</h2>
          <dl className="detail-meta">
            <div>
              <dt>Período</dt>
              <dd>
                {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
              </dd>
            </div>
            <div>
              <dt>Orçamento</dt>
              <dd>{formatCurrency(campaign.budget)}</dd>
            </div>
            <div>
              <dt>Meta</dt>
              <dd>{campaign.goal}</dd>
            </div>
            {audience && (
              <>
                <div>
                  <dt>Faixa etária</dt>
                  <dd>{audience.ageRange}</dd>
                </div>
                <div>
                  <dt>Região</dt>
                  <dd>{audience.region || '—'}</dd>
                </div>
                <div>
                  <dt>Interesse</dt>
                  <dd>{audience.interest || '—'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      <section>
        <h2>Gastos</h2>
        <div className="card">
          {expenses.length === 0 ? (
            <p className="empty-state">Nenhum gasto registrado nesta campanha.</p>
          ) : (
            <ul className="record-list">
              {expenses.map((expense) => (
                <li key={expense.id}>
                  <span>{expense.description}</span>
                  <span>
                    <span className="record-date">{formatDate(expense.date)}</span>{' '}
                    <span className="record-value">{formatCurrency(expense.amount)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="expense-description">Descrição do gasto</label>
                <input
                  id="expense-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="expense-amount">Valor (R$)</label>
                <input
                  id="expense-amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="expense-date">Data</label>
                <input
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit">Registrar gasto</button>
          </form>
        </div>
      </section>

      <section>
        <h2>Métricas</h2>
        <div className="card">
          {metrics.length === 0 ? (
            <p className="empty-state">Nenhuma métrica registrada nesta campanha.</p>
          ) : (
            <ul className="record-list">
              {metrics.map((metric) => (
                <li key={metric.id}>
                  <span className="record-date">{formatDate(metric.date)}</span>
                  <span className="record-value">
                    {formatNumber(metric.reach)} alcance · {formatNumber(metric.clicks)} cliques ·{' '}
                    {formatNumber(metric.conversions)} conversões
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleMetricSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="metric-date">Data da métrica</label>
                <input
                  id="metric-date"
                  type="date"
                  value={metricDate}
                  onChange={(event) => setMetricDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="metric-reach">Alcance</label>
                <input
                  id="metric-reach"
                  type="number"
                  min="0"
                  value={reach}
                  onChange={(event) => setReach(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="metric-clicks">Cliques</label>
                <input
                  id="metric-clicks"
                  type="number"
                  min="0"
                  value={clicks}
                  onChange={(event) => setClicks(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="metric-conversions">Conversões</label>
                <input
                  id="metric-conversions"
                  type="number"
                  min="0"
                  value={conversions}
                  onChange={(event) => setConversions(event.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit">Registrar métrica</button>
          </form>

          <form onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="metrics-csv-input">Arquivo CSV</label>
            <input id="metrics-csv-input" type="file" accept=".csv" onChange={handleCsvUpload} />
            <span className="kpi-sub" style={{ marginTop: '6px' }}>
              Colunas esperadas: date, reach, clicks, conversions
            </span>
          </form>

          {csvResult && (
            <div className="import-result">
              <p>
                {csvResult.imported}{' '}
                {csvResult.imported === 1 ? 'métrica importada' : 'métricas importadas'}
              </p>
              {csvResult.errors.length > 0 && (
                <ul>
                  {csvResult.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CampaignDetailPage
