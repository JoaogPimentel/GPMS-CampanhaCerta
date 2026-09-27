import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Página inicial</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza os campos de e-mail e senha', () => {
    renderLoginPage()

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('efetua login com credenciais válidas e navega para a página inicial', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Página inicial')).toBeInTheDocument()
  })

  it('exibe mensagem de erro com credenciais inválidas', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha-errada')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/credenciais inválidas/i)).toBeInTheDocument()
  })

  it('não exibe link de cadastro público', () => {
    renderLoginPage()

    expect(screen.queryByRole('link', { name: /cadastr/i })).not.toBeInTheDocument()
  })
})
