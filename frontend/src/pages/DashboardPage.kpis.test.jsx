import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createExpense } from '../services/expenseService'
import DashboardPage from './DashboardPage'

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campanhas/:id" element={<div>Detalhes da campanha</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function kpiCard(label) {
  return screen.getByText(label).closest('.kpi-card')
}

describe('DashboardPage - KPIs (visão geral)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('campanhacerta_campaigns', JSON.stringify([]))
    localStorage.setItem('campanhacerta_expenses', JSON.stringify([]))
  })

  it('exibe orçamento total, gasto total, campanhas ativas e alertas de orçamento', async () => {
    const campaignA = await createCampaign({
      name: 'Campanha A',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'em_andamento',
      conversionValue: 10,
    })
    const campaignB = await createCampaign({
      name: 'Campanha B',
      channel: 'E-mail',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 2000,
      goal: 'Teste',
      status: 'em_andamento',
      conversionValue: 10,
    })
    await createExpense({
      campaignId: campaignA.id,
      description: 'Gasto',
      amount: 950,
      date: '2026-01-05',
    })
    await createExpense({
      campaignId: campaignB.id,
      description: 'Gasto',
      amount: 100,
      date: '2026-01-05',
    })

    renderDashboard()
    // "Campanha A" está em risco: aparece no bloco de atenção e na tabela.
    await screen.findAllByText('Campanha A')

    expect(within(kpiCard('Orçamento total')).getByText('R$ 3.000')).toBeInTheDocument()
    expect(within(kpiCard('Gasto total')).getByText('R$ 1.050')).toBeInTheDocument()
    expect(within(kpiCard('Campanhas ativas')).getByText('2')).toBeInTheDocument()
    expect(within(kpiCard('Alertas de orçamento')).getByText('1')).toBeInTheDocument()
  })
})
