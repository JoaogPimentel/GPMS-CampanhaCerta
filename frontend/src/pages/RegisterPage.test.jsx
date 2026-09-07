import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import RegisterPage from './RegisterPage'

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <AuthProvider>
        <Routes>
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route path="/" element={<div>Página inicial</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza os campos de nome, e-mail e senha', () => {
    renderRegisterPage()

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('cadastra um novo usuário e navega para a página inicial', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText(/nome/i), 'Novo Usuário')
    await user.type(screen.getByLabelText(/e-mail/i), 'novo@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByText('Página inicial')).toBeInTheDocument()
  })

  it('exibe erro ao tentar cadastrar e-mail já existente', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText(/nome/i), 'Duplicado')
    await user.type(screen.getByLabelText(/e-mail/i), 'admin@campanhacerta.com')
    await user.type(screen.getByLabelText(/senha/i), 'outrasenha')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByText(/e-mail já cadastrado/i)).toBeInTheDocument()
  })
})
