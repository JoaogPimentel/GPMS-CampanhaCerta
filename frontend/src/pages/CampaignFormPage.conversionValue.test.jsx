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

describe('CampaignFormPage - valor por conversão (RF07)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('define o valor por conversão ao criar uma campanha', async () => {
    const user = userEvent.setup()
    renderCreate()

    await user.type(screen.getByLabelText(/nome da campanha/i), 'Campanha com Valor')
    await user.type(screen.getByLabelText(/data de início/i), '2026-01-01')
    await user.type(screen.getByLabelText(/data de fim/i), '2026-01-31')
    await user.type(screen.getByLabelText(/orçamento/i), '1000')
    await user.type(screen.getByLabelText(/meta/i), 'Teste')
    await user.type(screen.getByLabelText(/valor por conversão/i), '75')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await screen.findByText('Lista de campanhas')
    const campaigns = await getCampaigns()
    const created = campaigns.find((campaign) => campaign.name === 'Campanha com Valor')

    expect(created.conversionValue).toBe(75)
  })

  it('carrega o valor por conversão salvo no modo edição', async () => {
    const created = await createCampaign({
      name: 'Campanha com Valor Salvo',
      channel: 'Facebook',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      budget: 700,
      goal: 'Teste',
      status: 'planejada',
      conversionValue: 60,
    })

    renderEdit(created.id)

    expect(await screen.findByDisplayValue('Campanha com Valor Salvo')).toBeInTheDocument()
    expect(screen.getByLabelText(/valor por conversão/i)).toHaveValue(60)
  })
})
