import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createPublication, getPublications } from '../services/publicationService'
import PublicationFormPage from './PublicationFormPage'

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/calendario/nova']}>
      <Routes>
        <Route path="/calendario/nova" element={<PublicationFormPage />} />
        <Route path="/calendario/:id/editar" element={<PublicationFormPage />} />
        <Route path="/calendario" element={<div>Calendário</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderEdit(publicationId) {
  return render(
    <MemoryRouter initialEntries={[`/calendario/${publicationId}/editar`]}>
      <Routes>
        <Route path="/calendario/nova" element={<PublicationFormPage />} />
        <Route path="/calendario/:id/editar" element={<PublicationFormPage />} />
        <Route path="/calendario" element={<div>Calendário</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function createTestCampaign() {
  return createCampaign({
    name: 'Campanha para Publicação',
    channel: 'Instagram',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    budget: 500,
    goal: 'Teste',
    status: 'planejada',
  })
}

describe('PublicationFormPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cria uma nova publicação vinculada a uma campanha', async () => {
    const campaign = await createTestCampaign()
    const user = userEvent.setup()
    renderCreate()

    await screen.findByRole('option', { name: 'Campanha para Publicação' })
    await user.selectOptions(screen.getByLabelText(/campanha/i), String(campaign.id))
    await user.type(screen.getByLabelText(/título/i), 'Novo Post')
    await user.type(screen.getByLabelText(/data/i), '2026-01-20')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Calendário')).toBeInTheDocument()
    const publications = await getPublications()
    expect(publications.some((publication) => publication.title === 'Novo Post')).toBe(true)
  })

  it('carrega os dados da publicação existente no modo edição', async () => {
    const campaign = await createTestCampaign()
    const created = await createPublication({
      campaignId: campaign.id,
      title: 'Post Existente',
      description: 'Descrição',
      date: '2026-01-15',
    })

    renderEdit(created.id)

    expect(await screen.findByDisplayValue('Post Existente')).toBeInTheDocument()
  })

  it('atualiza uma publicação existente', async () => {
    const campaign = await createTestCampaign()
    const created = await createPublication({
      campaignId: campaign.id,
      title: 'Post para Editar',
      description: '',
      date: '2026-01-15',
    })
    const user = userEvent.setup()
    renderEdit(created.id)
    await screen.findByDisplayValue('Post para Editar')

    const titleInput = screen.getByLabelText(/título/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Post Editado')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Calendário')).toBeInTheDocument()
    const publications = await getPublications()
    expect(publications.find((publication) => publication.id === created.id).title).toBe(
      'Post Editado',
    )
  })
})
