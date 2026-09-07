import { STATUS_LABELS } from './campaignOptions'

function escapeCsvValue(value) {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function buildCampaignReportCsv({ campaign, indicators }) {
  const rows = [
    ['Campo', 'Valor'],
    ['Nome', campaign.name],
    ['Canal', campaign.channel],
    ['Período', `${campaign.startDate} a ${campaign.endDate}`],
    ['Orçamento', campaign.budget],
    ['Gasto total', indicators.totalSpent],
    ['Meta', campaign.goal],
    ['Status', STATUS_LABELS[campaign.status] ?? campaign.status],
    ['Alcance total', indicators.totalReach],
    ['Cliques totais', indicators.totalClicks],
    ['Conversões totais', indicators.totalConversions],
    ['CTR (%)', indicators.ctr.toFixed(2)],
    ['CPA', indicators.cpa.toFixed(2)],
    ['ROI simplificado (%)', indicators.roi.toFixed(2)],
  ]

  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}
