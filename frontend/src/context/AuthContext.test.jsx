import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

function Consumer() {
  const { user, isAuthenticated, login, logout, register } = useAuth()

  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'logado' : 'deslogado'}</span>
      <span data-testid="role">{user?.role ?? ''}</span>
      <button onClick={() => login('admin@campanhacerta.com', 'admin123')}>Entrar</button>
      <button onClick={() => register('Fulano', 'fulano@campanhacerta.com', 'senha123')}>
        Cadastrar
      </button>
      <button onClick={logout}>Sair</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('inicia deslogado quando não há sessão salva', () => {
    renderWithProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('deslogado')
  })

  it('autentica e expõe o usuário logado', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logado'))
    expect(screen.getByTestId('role')).toHaveTextContent('admin')
  })

  it('cadastra um novo usuário e já autentica', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logado'))
    expect(screen.getByTestId('role')).toHaveTextContent('analista')
  })

  it('desloga e limpa o usuário', async () => {
    const user = userEvent.setup()
    renderWithProvider()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logado'))

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(screen.getByTestId('status')).toHaveTextContent('deslogado')
  })

  it('mantém a sessão ao remontar o provider (persistência)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProvider()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logado'))
    unmount()

    renderWithProvider()

    expect(screen.getByTestId('status')).toHaveTextContent('logado')
  })
})
