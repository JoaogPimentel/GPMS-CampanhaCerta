import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign } from '../services/campaignService'
import CampaignDetailPage from './CampaignDetailPage'

function renderDetail(campaignId) {
  return render(
    <MemoryRouter initialEntries={[`/campanhas/${campaignId}`]}>
      <Routes>
        <Route path="/campanhas/:id" element={<CampaignDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function createTestCampaign() {
  return createCampaign({
    name: 'Campanha com Métricas',
    channel: 'Instagram',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    budget: 1000,
    goal: 'Teste',
    status: 'planejada',
  })
}

describe('CampaignDetailPage - métricas (RF06)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('registra uma métrica manualmente e exibe na lista', async () => {
    const campaign = await createTestCampaign()
    const user = userEvent.setup()
    renderDetail(campaign.id)
    await screen.findByRole('heading', { name: 'Campanha com Métricas' })

    await user.type(screen.getByLabelText(/data da métrica/i), '2026-01-10')
    await user.type(screen.getByLabelText(/alcance/i), '1000')
    await user.type(screen.getByLabelText(/cliques/i), '80')
    await user.type(screen.getByLabelText(/conversões/i), '10')
    await user.click(screen.getByRole('button', { name: /registrar métrica/i }))

    expect(await screen.findByText('10/01/2026')).toBeInTheDocument()
    expect(
      await screen.findByText(/1\.000 alcance · 80 cliques · 10 conversões/),
    ).toBeInTheDocument()
  })

  it('importa métricas via CSV válido', async () => {
    const campaign = await createTestCampaign()
    const user = userEvent.setup()
    renderDetail(campaign.id)
    await screen.findByRole('heading', { name: 'Campanha com Métricas' })

    const csvContent = 'date,reach,clicks,conversions\n2026-02-01,300,20,3\n2026-02-02,400,30,4'
    const file = new File([csvContent], 'metricas.csv', { type: 'text/csv' })

    await user.upload(screen.getByLabelText(/arquivo csv/i), file)

    expect(await screen.findByText(/2 métricas importadas/i)).toBeInTheDocument()
    expect(screen.getByText('01/02/2026')).toBeInTheDocument()
    expect(screen.getByText('02/02/2026')).toBeInTheDocument()
  })

  it('reporta erros de linhas inválidas do CSV sem descartar as válidas', async () => {
    const campaign = await createTestCampaign()
    const user = userEvent.setup()
    renderDetail(campaign.id)
    await screen.findByRole('heading', { name: 'Campanha com Métricas' })

    const csvContent = 'date,reach,clicks,conversions\n2026-03-01,300,20,3\n2026-03-02,abc,30,4'
    const file = new File([csvContent], 'metricas.csv', { type: 'text/csv' })

    await user.upload(screen.getByLabelText(/arquivo csv/i), file)

    expect(await screen.findByText(/1 métrica importada/i)).toBeInTheDocument()
    expect(screen.getByText(/linha 3/i)).toBeInTheDocument()
  })
})
