import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
          <Route path="/login" element={<div>Tela de login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe os links de navegação principais quando autenticado', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

    renderLayout()

    expect(screen.getByRole('link', { name: /visão geral/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /campanhas/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /calendário/i })).toBeInTheDocument()
  })

  it('desloga e redireciona para o login ao clicar em Sair', async () => {
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: /sair/i }))

    expect(await screen.findByText('Tela de login')).toBeInTheDocument()
  })
})
