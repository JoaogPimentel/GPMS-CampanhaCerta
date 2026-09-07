import { seedMetrics } from '../mocks/metrics'
import { nextId } from '../utils/nextId'

const METRICS_KEY = 'campanhacerta_metrics'
const REQUIRED_COLUMNS = ['date', 'reach', 'clicks', 'conversions']

function loadMetrics() {
  const raw = localStorage.getItem(METRICS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(METRICS_KEY, JSON.stringify(seedMetrics))
  return seedMetrics
}

function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics))
}

export async function getMetricsByCampaign(campaignId) {
  return loadMetrics().filter((metric) => metric.campaignId === Number(campaignId))
}

export async function createMetric({ campaignId, date, reach, clicks, conversions }) {
  const metrics = loadMetrics()
  const metric = {
    id: nextId(metrics),
    campaignId: Number(campaignId),
    date,
    reach: Number(reach),
    clicks: Number(clicks),
    conversions: Number(conversions),
  }
  saveMetrics([...metrics, metric])
  return metric
}

export function parseMetricsCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  const [header, ...rows] = lines
  const columns = header.split(',').map((column) => column.trim().toLowerCase())

  const parsed = []
  const errors = []

  rows.forEach((line, index) => {
    if (!line.trim()) return
    const rowNumber = index + 2

    const cells = line.split(',').map((cell) => cell.trim())
    const row = {}
    columns.forEach((column, columnIndex) => {
      row[column] = cells[columnIndex]
    })

    const missing = REQUIRED_COLUMNS.filter((column) => !row[column])
    if (missing.length > 0) {
      errors.push(`Linha ${rowNumber}: campos ausentes (${missing.join(', ')})`)
      return
    }

    const reach = Number(row.reach)
    const clicks = Number(row.clicks)
    const conversions = Number(row.conversions)

    if ([reach, clicks, conversions].some(Number.isNaN)) {
      errors.push(`Linha ${rowNumber}: valores numéricos inválidos`)
      return
    }

    parsed.push({ date: row.date, reach, clicks, conversions })
  })

  return { parsed, errors }
}

export async function importMetricsCsv(campaignId, csvText) {
  const { parsed, errors } = parseMetricsCsv(csvText)

  for (const row of parsed) {
    await createMetric({ campaignId, ...row })
  }

  return { imported: parsed.length, errors }
}
