import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BudgetBar from './BudgetBar'

function figuresOf(container) {
  return container.querySelector('.budget-bar-figures')
}

describe('BudgetBar', () => {
  it('não exibe chip de risco quando o orçamento está saudável', () => {
    const { container } = render(<BudgetBar spent={500} budget={2000} />)

    expect(screen.queryByText(/perto do limite/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/orçamento estourado/i)).not.toBeInTheDocument()
    expect(figuresOf(container)).toHaveTextContent('R$ 500 de R$ 2.000 · 25%')
  })

  it('exibe chip "Perto do limite" quando o gasto está entre 75% e 99%', () => {
    const { container } = render(<BudgetBar spent={1900} budget={2000} />)

    expect(screen.getByText(/perto do limite/i)).toBeInTheDocument()
    expect(figuresOf(container)).toHaveTextContent('R$ 1.900 de R$ 2.000 · 95%')
  })

  it('exibe chip "Orçamento estourado" quando o gasto atinge ou ultrapassa 100%', () => {
    const { container } = render(<BudgetBar spent={2500} budget={2000} />)

    expect(screen.getByText(/orçamento estourado/i)).toBeInTheDocument()
    expect(figuresOf(container)).toHaveTextContent('R$ 2.500 de R$ 2.000 · 125%')
  })
})
