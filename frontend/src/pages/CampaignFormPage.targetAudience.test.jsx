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

async function fillRequiredBaseFields(user) {
  await user.type(screen.getByLabelText(/nome da campanha/i), 'Campanha com Público')
  await user.type(screen.getByLabelText(/data de início/i), '2026-06-01')
  await user.type(screen.getByLabelText(/data de fim/i), '2026-06-30')
  await user.type(screen.getByLabelText(/orçamento/i), '1000')
  await user.type(screen.getByLabelText(/meta/i), 'Testar público-alvo')
}

describe('CampaignFormPage - público-alvo (RF03)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('define o público-alvo ao criar uma campanha', async () => {
    const user = userEvent.setup()
    renderCreate()

    await fillRequiredBaseFields(user)
    await user.selectOptions(screen.getByLabelText(/faixa etária/i), '25-34')
    await user.type(screen.getByLabelText(/região/i), 'Sudeste')
    await user.type(screen.getByLabelText(/interesse/i), 'Tecnologia')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await screen.findByText('Lista de campanhas')
    const campaigns = await getCampaigns()
    const created = campaigns.find((campaign) => campaign.name === 'Campanha com Público')

    expect(created.targetAudience).toMatchObject({
      ageRange: '25-34',
      region: 'Sudeste',
      interest: 'Tecnologia',
    })
  })

  it('carrega o público-alvo salvo no modo edição', async () => {
    const created = await createCampaign({
      name: 'Campanha com Público Salvo',
      channel: 'Facebook',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      budget: 700,
      goal: 'Testar edição de público',
      status: 'planejada',
      targetAudience: { ageRange: '35-44', region: 'Sul', interest: 'Esportes' },
    })

    renderEdit(created.id)

    await screen.findByDisplayValue('Campanha com Público Salvo')
    expect(screen.getByLabelText(/faixa etária/i)).toHaveValue('35-44')
    expect(screen.getByLabelText(/região/i)).toHaveValue('Sul')
    expect(screen.getByLabelText(/interesse/i)).toHaveValue('Esportes')
  })

  it('atualiza o público-alvo de uma campanha existente', async () => {
    const created = await createCampaign({
      name: 'Campanha para Atualizar Público',
      channel: 'Facebook',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      budget: 900,
      goal: 'Testar atualização de público',
      status: 'planejada',
      targetAudience: { ageRange: '18-24', region: 'Norte', interest: 'Games' },
    })
    const user = userEvent.setup()
    renderEdit(created.id)
    await screen.findByDisplayValue('Campanha para Atualizar Público')

    const regionInput = screen.getByLabelText(/região/i)
    await user.clear(regionInput)
    await user.type(regionInput, 'Nordeste')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await screen.findByText('Lista de campanhas')
    const campaigns = await getCampaigns()
    const updated = campaigns.find((campaign) => campaign.id === created.id)

    expect(updated.targetAudience).toMatchObject({ region: 'Nordeste' })
  })
})
