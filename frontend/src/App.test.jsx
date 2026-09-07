import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'

function renderApp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redireciona para o login quando não há usuário autenticado', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument()
  })
})
