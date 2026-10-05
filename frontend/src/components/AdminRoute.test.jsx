import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import AdminRoute from './AdminRoute'

function renderProtected(initialEntry = '/restrita') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route path="/dashboard" element={<div>Visão geral</div>} />
          <Route
            path="/restrita"
            element={
              <AdminRoute>
                <div>Conteúdo restrito a admin</div>
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redireciona para o login quando não há usuário autenticado', () => {
    renderProtected()

    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('redireciona para o dashboard quando o usuário autenticado não é admin', async () => {
    await login({ email: 'analista@campanhacerta.com', password: 'analista123' })

    renderProtected()

    expect(screen.getByText('Visão geral')).toBeInTheDocument()
  })

  it('renderiza o conteúdo quando o usuário autenticado é admin', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

    renderProtected()

    expect(screen.getByText('Conteúdo restrito a admin')).toBeInTheDocument()
  })
})
