import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import CampaignsListPage from './CampaignsListPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/campanhas']}>
      <AuthProvider>
        <Routes>
          <Route path="/campanhas" element={<CampaignsListPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('CampaignsListPage - permissões por perfil (RF09)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('permite excluir campanhas quando o usuário é administrador', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

    renderPage()

    expect(
      await screen.findByRole('button', { name: /excluir campanha de lançamento/i }),
    ).toBeInTheDocument()
  })

  it('oculta a exclusão de campanhas quando o usuário é analista', async () => {
    await login({ email: 'analista@campanhacerta.com', password: 'analista123' })

    renderPage()

    await screen.findByText('Campanha de Lançamento')
    expect(
      screen.queryByRole('button', { name: /excluir campanha de lançamento/i }),
    ).not.toBeInTheDocument()
  })

  it('ainda permite editar campanhas quando o usuário é analista', async () => {
    await login({ email: 'analista@campanhacerta.com', password: 'analista123' })

    renderPage()

    expect(
      await screen.findByRole('link', { name: /editar campanha de lançamento/i }),
    ).toBeInTheDocument()
  })
})
