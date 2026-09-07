import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCampaign } from '../services/campaignService'
import { createPublication } from '../services/publicationService'
import CalendarPage from './CalendarPage'

function renderCalendar() {
  return render(
    <MemoryRouter initialEntries={['/calendario']}>
      <Routes>
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/calendario/nova" element={<div>Formulário de nova publicação</div>} />
        <Route path="/calendario/:id/editar" element={<div>Formulário de edição</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function createTestCampaign() {
  return createCampaign({
    name: 'Campanha do Calendário',
    channel: 'Instagram',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    budget: 500,
    goal: 'Teste',
    status: 'planejada',
  })
}

describe('CalendarPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe as publicações do mês atual e não as de outros meses', async () => {
    const campaign = await createTestCampaign()
    await createPublication({
      campaignId: campaign.id,
      title: 'Post de Março',
      description: '',
      date: '2026-03-10',
    })
    await createPublication({
      campaignId: campaign.id,
      title: 'Post de Abril',
      description: '',
      date: '2026-04-05',
    })

    renderCalendar()

    expect(await screen.findByText(/março 2026/i)).toBeInTheDocument()
    expect(await screen.findByText(/post de março/i)).toBeInTheDocument()
    expect(screen.queryByText(/post de abril/i)).not.toBeInTheDocument()
  })

  it('navega para o mês seguinte e exibe as publicações correspondentes', async () => {
    const campaign = await createTestCampaign()
    await createPublication({
      campaignId: campaign.id,
      title: 'Post de Abril',
      description: '',
      date: '2026-04-05',
    })
    const user = userEvent.setup()
    renderCalendar()
    await screen.findByText(/março 2026/i)

    await user.click(screen.getByRole('button', { name: /próximo mês/i }))

    expect(await screen.findByText(/abril 2026/i)).toBeInTheDocument()
    expect(await screen.findByText(/post de abril/i)).toBeInTheDocument()
  })

  it('navega para o formulário de nova publicação', async () => {
    const user = userEvent.setup()
    renderCalendar()

    await user.click(screen.getByRole('link', { name: /nova publicação/i }))

    expect(await screen.findByText('Formulário de nova publicação')).toBeInTheDocument()
  })
})
