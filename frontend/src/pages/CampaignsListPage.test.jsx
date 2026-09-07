import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import { createCampaign } from '../services/campaignService'
import CampaignsListPage from './CampaignsListPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/campanhas']}>
      <AuthProvider>
        <Routes>
          <Route path="/campanhas" element={<CampaignsListPage />} />
          <Route path="/campanhas/nova" element={<div>Formulário de nova campanha</div>} />
          <Route path="/campanhas/:id/editar" element={<div>Formulário de edição</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('CampaignsListPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })
  })

  it('lista as campanhas existentes com nome, canal e status', async () => {
    renderPage()

    expect(await screen.findByText(/campanha de lançamento/i)).toBeInTheDocument()
  })

  it('navega para o formulário de nova campanha', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('link', { name: /nova campanha/i }))

    expect(await screen.findByText('Formulário de nova campanha')).toBeInTheDocument()
  })

  it('navega para o formulário de edição de uma campanha existente', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('link', { name: /editar campanha de lançamento/i }))

    expect(await screen.findByText('Formulário de edição')).toBeInTheDocument()
  })

  it('exclui uma campanha após confirmar a exclusão', async () => {
    await createCampaign({
      name: 'Campanha Removível',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 100,
      goal: 'Teste',
      status: 'planejada',
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Campanha Removível')

    await user.click(screen.getByRole('button', { name: /excluir campanha removível/i }))
    await user.click(screen.getByRole('button', { name: /confirmar exclusão/i }))

    expect(screen.queryByText('Campanha Removível')).not.toBeInTheDocument()
  })

  it('mantém a campanha quando a exclusão é cancelada', async () => {
    await createCampaign({
      name: 'Campanha Mantida',
      channel: 'Instagram',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      budget: 100,
      goal: 'Teste',
      status: 'planejada',
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Campanha Mantida')

    await user.click(screen.getByRole('button', { name: /excluir campanha mantida/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.getByText('Campanha Mantida')).toBeInTheDocument()
  })
})
