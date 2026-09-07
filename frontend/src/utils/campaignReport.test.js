import { describe, expect, it } from 'vitest'
import { buildCampaignReportCsv } from './campaignReport'

describe('buildCampaignReportCsv', () => {
  it('gera um CSV com os principais dados da campanha', () => {
    const campaign = {
      name: 'Campanha de Teste',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 5000,
      goal: 'Testar exportação',
      status: 'em_andamento',
    }
    const indicators = {
      totalSpent: 4200,
      totalReach: 4500,
      totalClicks: 340,
      totalConversions: 45,
      ctr: 7.555555555555555,
      cpa: 93.333333,
      roi: -14.285714,
    }

    const csv = buildCampaignReportCsv({ campaign, indicators })

    expect(csv).toContain('Nome,Campanha de Teste')
    expect(csv).toContain('Orçamento,5000')
    expect(csv).toContain('Gasto total,4200')
    expect(csv).toContain('Status,Em andamento')
    expect(csv).toContain('CTR (%),7.56')
    expect(csv).toContain('CPA,93.33')
    expect(csv).toContain('ROI simplificado (%),-14.29')
  })

  it('coloca entre aspas valores que contêm vírgula', () => {
    const campaign = {
      name: 'Campanha, com vírgula',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 100,
      goal: 'Teste',
      status: 'planejada',
    }
    const indicators = {
      totalSpent: 0,
      totalReach: 0,
      totalClicks: 0,
      totalConversions: 0,
      ctr: 0,
      cpa: 0,
      roi: 0,
    }

    const csv = buildCampaignReportCsv({ campaign, indicators })

    expect(csv).toContain('"Campanha, com vírgula"')
  })
})
