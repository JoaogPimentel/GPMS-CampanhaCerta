import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber } from './format'

describe('formatCurrency', () => {
  it('formata valores em reais sem casas decimais', () => {
    expect(formatCurrency(4200)).toBe('R$ 4.200')
  })

  it('trata valores ausentes como zero', () => {
    expect(formatCurrency(undefined)).toBe('R$ 0')
  })
})

describe('formatNumber', () => {
  it('usa separador de milhar brasileiro', () => {
    expect(formatNumber(28400)).toBe('28.400')
  })
})

describe('formatDate', () => {
  it('converte data ISO para o formato brasileiro', () => {
    expect(formatDate('2026-01-31')).toBe('31/01/2026')
  })

  it('retorna string vazia quando não há data', () => {
    expect(formatDate('')).toBe('')
  })
})
