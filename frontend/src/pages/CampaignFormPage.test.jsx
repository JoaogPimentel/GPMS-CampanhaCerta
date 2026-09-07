import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign, getCampaigns } from '../services/campaignService'
import CampaignFormPage from './CampaignFormPage'

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/campanhas/nova']}>
      <Routes>
        <Route path="/campanhas/nova" element={<CampaignFormPage />} />
        <Route path="/campanhas/:id/editar" element={<CampaignFormPage />} />
        <Route path="/campanhas" element={<div>Lista de campanhas</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderEdit(campaignId) {
  return render(
    <MemoryRouter initialEntries={[`/campanhas/${campaignId}/editar`]}>
      <Routes>
        <Route path="/campanhas/nova" element={<CampaignFormPage />} />
        <Route path="/campanhas/:id/editar" element={<CampaignFormPage />} />
        <Route path="/campanhas" element={<div>Lista de campanhas</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CampaignFormPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cria uma nova campanha e volta para a listagem', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.type(screen.getByLabelText(/nome da campanha/i), 'Campanha Nova')
    await user.selectOptions(screen.getByLabelText(/^canal/i), 'Instagram')
    await user.type(screen.getByLabelText(/data de início/i), '2026-05-01')
    await user.type(screen.getByLabelText(/data de fim/i), '2026-05-31')
    await user.type(screen.getByLabelText(/orçamento/i), '1500')
    await user.type(screen.getByLabelText(/meta/i), 'Gerar 100 leads')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Lista de campanhas')).toBeInTheDocument()
    const campaigns = await getCampaigns()
    expect(campaigns.some((campaign) => campaign.name === 'Campanha Nova')).toBe(true)
  })

  it('carrega os dados da campanha existente no modo edição', async () => {
    const created = await createCampaign({
      name: 'Campanha Existente',
      channel: 'Facebook',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      budget: 800,
      goal: 'Aumentar alcance',
      status: 'planejada',
    })

    renderEdit(created.id)

    expect(await screen.findByDisplayValue('Campanha Existente')).toBeInTheDocument()
  })

  it('atualiza uma campanha existente, incluindo o status', async () => {
    const created = await createCampaign({
      name: 'Campanha para Editar',
      channel: 'Facebook',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      budget: 800,
      goal: 'Aumentar alcance',
      status: 'planejada',
    })
    const user = userEvent.setup()
    renderEdit(created.id)
    await screen.findByDisplayValue('Campanha para Editar')

    const nameInput = screen.getByLabelText(/nome da campanha/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Campanha Editada')
    await user.selectOptions(screen.getByLabelText(/status/i), 'em_andamento')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Lista de campanhas')).toBeInTheDocument()
    const campaigns = await getCampaigns()
    expect(campaigns.find((campaign) => campaign.id === created.id)).toMatchObject({
      name: 'Campanha Editada',
      status: 'em_andamento',
    })
  })
})
