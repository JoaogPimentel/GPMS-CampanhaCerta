import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createExpense } from '../services/expenseService'
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

describe('CampaignDetailPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe os dados da campanha e o total gasto', async () => {
    const campaign = await createCampaign({
      name: 'Campanha com Gastos',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
    })
    await createExpense({
      campaignId: campaign.id,
      description: 'Anúncio',
      amount: 300,
      date: '2026-01-05',
    })

    const { container } = renderDetail(campaign.id)

    expect(await screen.findByRole('heading', { name: 'Campanha com Gastos' })).toBeInTheDocument()
    expect(await screen.findByText(/anúncio/i)).toBeInTheDocument()
    expect(container.querySelector('.budget-bar-figures')).toHaveTextContent('R$ 300 de R$ 1.000')
  })

  it('registra um novo gasto e atualiza o total', async () => {
    const campaign = await createCampaign({
      name: 'Campanha para Registrar Gasto',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
    })
    const user = userEvent.setup()
    const { container } = renderDetail(campaign.id)
    await screen.findByRole('heading', { name: 'Campanha para Registrar Gasto' })

    await user.type(screen.getByLabelText(/descrição do gasto/i), 'Impulsionamento')
    await user.type(screen.getByLabelText(/valor/i), '150')
    await user.type(screen.getByLabelText(/^data$/i), '2026-01-10')
    await user.click(screen.getByRole('button', { name: /registrar gasto/i }))

    expect(await screen.findByText(/impulsionamento/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(container.querySelector('.budget-bar-figures')).toHaveTextContent(
        'R$ 150 de R$ 1.000',
      ),
    )
  })

  it('exibe alerta quando o total gasto ultrapassa o orçamento', async () => {
    const campaign = await createCampaign({
      name: 'Campanha Estourada',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 500,
      goal: 'Teste',
      status: 'planejada',
    })
    await createExpense({
      campaignId: campaign.id,
      description: 'Gasto Alto',
      amount: 600,
      date: '2026-01-05',
    })

    renderDetail(campaign.id)

    expect(await screen.findByRole('alert')).toHaveTextContent(/orçamento ultrapassado/i)
  })

  it('não exibe alerta quando o gasto está dentro do orçamento', async () => {
    const campaign = await createCampaign({
      name: 'Campanha Dentro do Orçamento',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 1000,
      goal: 'Teste',
      status: 'planejada',
    })
    await createExpense({
      campaignId: campaign.id,
      description: 'Gasto Normal',
      amount: 200,
      date: '2026-01-05',
    })

    renderDetail(campaign.id)
    await screen.findByText(/gasto normal/i)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
