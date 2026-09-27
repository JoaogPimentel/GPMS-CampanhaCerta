import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-screen">
      <main className="auth-card">
        <div className="auth-brand">
          <span className="app-brand-mark" aria-hidden="true">
            C
          </span>
          <span className="app-brand-name">CampanhaCerta</span>
        </div>

        <h1>Entrar</h1>
        <p className="auth-sub">Acesse o painel das suas campanhas.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit">Entrar</button>
        </form>

        <p className="auth-hint">
          Contas de demonstração:
          <br />
          <code>admin@campanhacerta.com</code> / <code>admin123</code>
          <br />
          <code>analista@campanhacerta.com</code> / <code>analista123</code>
        </p>
      </main>
    </div>
  )
}

export default LoginPage
