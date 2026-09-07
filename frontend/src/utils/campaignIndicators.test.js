import { describe, expect, it } from 'vitest'
import { computeIndicators } from './campaignIndicators'

describe('computeIndicators', () => {
  it('calcula CTR, CPA e ROI simplificado a partir de métricas e gastos', () => {
    const campaign = { conversionValue: 100 }
    const metrics = [{ reach: 1000, clicks: 100, conversions: 10 }]
    const expenses = [{ amount: 500 }]

    const indicators = computeIndicators(campaign, metrics, expenses)

    expect(indicators.totalReach).toBe(1000)
    expect(indicators.totalClicks).toBe(100)
    expect(indicators.totalConversions).toBe(10)
    expect(indicators.totalSpent).toBe(500)
    expect(indicators.ctr).toBe(10)
    expect(indicators.cpa).toBe(50)
    expect(indicators.roi).toBe(100)
  })

  it('soma múltiplas métricas e gastos da mesma campanha', () => {
    const campaign = { conversionValue: 10 }
    const metrics = [
      { reach: 500, clicks: 50, conversions: 5 },
      { reach: 500, clicks: 50, conversions: 5 },
    ]
    const expenses = [{ amount: 50 }, { amount: 50 }]

    const indicators = computeIndicators(campaign, metrics, expenses)

    expect(indicators.totalReach).toBe(1000)
    expect(indicators.totalClicks).toBe(100)
    expect(indicators.totalConversions).toBe(10)
    expect(indicators.totalSpent).toBe(100)
  })

  it('retorna CTR zero quando não há alcance registrado', () => {
    const indicators = computeIndicators({ conversionValue: 0 }, [], [])

    expect(indicators.ctr).toBe(0)
  })

  it('retorna CPA zero quando não há conversões registradas', () => {
    const indicators = computeIndicators(
      { conversionValue: 0 },
      [{ reach: 100, clicks: 10, conversions: 0 }],
      [{ amount: 200 }],
    )

    expect(indicators.cpa).toBe(0)
  })

  it('retorna ROI zero quando não há gasto registrado', () => {
    const indicators = computeIndicators(
      { conversionValue: 50 },
      [{ reach: 100, clicks: 10, conversions: 5 }],
      [],
    )

    expect(indicators.roi).toBe(0)
  })
})
