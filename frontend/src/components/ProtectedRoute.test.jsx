import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import ProtectedRoute from './ProtectedRoute'

function renderProtected(initialEntry = '/privada') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route
            path="/privada"
            element={
              <ProtectedRoute>
                <div>Conteúdo privado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redireciona para o login quando não há usuário autenticado', () => {
    renderProtected()

    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('renderiza o conteúdo quando há sessão ativa', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

    renderProtected()

    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument()
  })
})
