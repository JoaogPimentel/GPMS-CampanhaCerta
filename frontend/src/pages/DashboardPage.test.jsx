import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createExpense } from '../services/expenseService'
import { createMetric } from '../services/metricService'
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

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe CTR, CPA e ROI simplificado calculados para uma campanha', async () => {
    const campaign = await createCampaign({
      name: 'Campanha do Dashboard',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
      conversionValue: 100,
    })
    await createMetric({
      campaignId: campaign.id,
      date: '2026-01-05',
      reach: 1000,
      clicks: 100,
      conversions: 10,
    })
    await createExpense({
      campaignId: campaign.id,
      description: 'Anúncio',
      amount: 500,
      date: '2026-01-05',
    })

    renderDashboard()

    expect(await screen.findByText('Campanha do Dashboard')).toBeInTheDocument()
    expect(screen.getByText('10.00%')).toBeInTheDocument()
    expect(screen.getByText('50.00')).toBeInTheDocument()
    expect(screen.getByText('100.00%')).toBeInTheDocument()
  })

  it('possui link para navegar aos detalhes da campanha', async () => {
    await createCampaign({
      name: 'Campanha com Link',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
      conversionValue: 0,
    })

    renderDashboard()

    expect(await screen.findByRole('link', { name: 'Campanha com Link' })).toBeInTheDocument()
  })
})
