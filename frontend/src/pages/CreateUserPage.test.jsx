import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { login } from '../services/authService'
import CreateUserPage from './CreateUserPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/usuarios/novo']}>
      <AuthProvider>
        <Routes>
          <Route path="/usuarios/novo" element={<CreateUserPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('CreateUserPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await login({ email: 'admin@campanhacerta.com', password: 'admin123' })
  })

  it('renderiza os campos de nome, e-mail, senha e perfil', () => {
    renderPage()

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/perfil/i)).toBeInTheDocument()
  })

  it('cria um novo usuário e mostra confirmação sem navegar para fora da página', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome/i), 'Novo Usuário')
    await user.type(screen.getByLabelText(/e-mail/i), 'novo@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /criar usuário/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/novo usuário criado/i)
  })

  it('exibe erro ao tentar criar com e-mail já existente', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome/i), 'Duplicado')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'outrasenha')
    await user.click(screen.getByRole('button', { name: /criar usuário/i }))

    expect(await screen.findByText(/e-mail já cadastrado/i)).toBeInTheDocument()
  })
})
