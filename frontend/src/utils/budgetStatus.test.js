import { describe, expect, it } from 'vitest'
import { getBudgetStatus } from './budgetStatus'

describe('getBudgetStatus', () => {
  it('retorna "healthy" quando o gasto está abaixo de 75% do orçamento', () => {
    expect(getBudgetStatus(1000, 2000)).toEqual({ level: 'healthy', percentage: 50 })
  })

  it('retorna "risk" a partir de exatamente 75% do orçamento', () => {
    expect(getBudgetStatus(1500, 2000)).toEqual({ level: 'risk', percentage: 75 })
  })

  it('retorna "risk" entre 75% e 99% do orçamento', () => {
    expect(getBudgetStatus(1900, 2000)).toEqual({ level: 'risk', percentage: 95 })
  })

  it('retorna "over" quando o gasto atinge 100% do orçamento', () => {
    expect(getBudgetStatus(2000, 2000)).toEqual({ level: 'over', percentage: 100 })
  })

  it('retorna "over" com percentual acima de 100 quando o gasto ultrapassa o orçamento', () => {
    expect(getBudgetStatus(2500, 2000)).toEqual({ level: 'over', percentage: 125 })
  })

  it('trata orçamento zero sem gasto como "healthy"', () => {
    expect(getBudgetStatus(0, 0)).toEqual({ level: 'healthy', percentage: 0 })
  })

  it('trata orçamento zero com algum gasto como "over"', () => {
    expect(getBudgetStatus(50, 0)).toEqual({ level: 'over', percentage: 100 })
  })
})
