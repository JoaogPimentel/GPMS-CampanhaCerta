import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
          <Route path="/campanhas/:id" element={<div>Detalhes da campanha</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('CampaignsListPage - navegação para detalhes (RF04/RF05)', () => {
  beforeEach(async () => {
    localStorage.clear()
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })
  })

  it('navega para os detalhes de uma campanha', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      await screen.findByRole('link', { name: /detalhes de campanha de lançamento/i }),
    )

    expect(await screen.findByText('Detalhes da campanha')).toBeInTheDocument()
  })
})
