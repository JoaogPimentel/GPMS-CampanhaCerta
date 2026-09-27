import { seedMetrics } from '../mocks/metrics'
import { nextId } from '../utils/nextId'
import { apiFetch, hasApi } from './apiClient'

const METRICS_KEY = 'campanhacerta_metrics'
const REQUIRED_COLUMNS = ['date', 'reach', 'clicks', 'conversions']

// ---- adaptador mock (localStorage) — usado em testes e sem backend configurado ----

function loadMetrics() {
  const raw = localStorage.getItem(METRICS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(METRICS_KEY, JSON.stringify(seedMetrics))
  return seedMetrics
}

function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics))
}

async function mockGetMetricsByCampaign(campaignId) {
  return loadMetrics().filter((metric) => metric.campaignId === Number(campaignId))
}

async function mockCreateMetric({ campaignId, date, reach, clicks, conversions }) {
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

async function mockImportMetricsCsv(campaignId, csvText) {
  const { parsed, errors } = parseMetricsCsv(csvText)

  for (const row of parsed) {
    await mockCreateMetric({ campaignId, ...row })
  }

  return { imported: parsed.length, errors }
}

// ---- adaptador HTTP — usado quando VITE_API_URL aponta para o backend Flask ----

async function httpGetMetricsByCampaign(campaignId) {
  return apiFetch(`/campaigns/${campaignId}/metrics`)
}

async function httpCreateMetric({ campaignId, date, reach, clicks, conversions }) {
  return apiFetch(`/campaigns/${campaignId}/metrics`, {
    method: 'POST',
    json: { date, reach: Number(reach), clicks: Number(clicks), conversions: Number(conversions) },
  })
}

async function httpImportMetricsCsv(campaignId, csvText) {
  return apiFetch(`/campaigns/${campaignId}/metrics/import-csv`, {
    method: 'POST',
    body: csvText,
    headers: { 'Content-Type': 'text/csv' },
  })
}

export async function getMetricsByCampaign(campaignId) {
  return hasApi ? httpGetMetricsByCampaign(campaignId) : mockGetMetricsByCampaign(campaignId)
}

export async function createMetric(data) {
  return hasApi ? httpCreateMetric(data) : mockCreateMetric(data)
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
  return hasApi ? httpImportMetricsCsv(campaignId, csvText) : mockImportMetricsCsv(campaignId, csvText)
}
