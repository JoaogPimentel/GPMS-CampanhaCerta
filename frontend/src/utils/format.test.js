import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber } from './format'

describe('formatCurrency', () => {
  it('formata valores em reais sem casas decimais', () => {
    expect(formatCurrency(4200)).toBe('R$ 4.200')
  })

  it('trata valores ausentes como zero', () => {
    expect(formatCurrency(undefined)).toBe('R$ 0')
  })

  it('mostra os centavos quando o valor não é inteiro', () => {
    expect(formatCurrency(150.5)).toBe('R$ 150,50')
    expect(formatCurrency(1234.99)).toBe('R$ 1.234,99')
  })

  it('não mostra centavos de erro de ponto flutuante', () => {
    expect(formatCurrency(0.1 + 0.2 + 99.7)).toBe('R$ 100')
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
