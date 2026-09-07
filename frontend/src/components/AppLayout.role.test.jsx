import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import AppLayout from './AppLayout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Conteúdo da home</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AppLayout - indicação de perfil (RF09)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe o perfil do administrador autenticado', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

    renderLayout()

    expect(await screen.findByText(/perfil: admin/i)).toBeInTheDocument()
  })

  it('exibe o perfil do analista autenticado', async () => {
    await login({ email: 'analista@campanhacerta.com', password: 'analista123' })

    renderLayout()

    expect(await screen.findByText(/perfil: analista/i)).toBeInTheDocument()
  })
})
