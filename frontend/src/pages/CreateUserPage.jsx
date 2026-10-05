import { useState } from 'react'
import { createUser } from '../services/authService'

function CreateUserPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('analista')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const user = await createUser({ name, email, password, role })
      setSuccess(`Usuário ${user.name} criado com perfil ${user.role}.`)
      setName('')
      setEmail('')
      setPassword('')
      setRole('analista')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Novo usuário</h1>
          <p className="page-head-sub">
            Apenas administradores podem criar novas contas (RF01, RF09).
          </p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="user-name">Nome</label>
              <input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="user-email">E-mail</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="user-password">Senha</label>
              <input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="user-role">Perfil</label>
              <select id="user-role" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="analista">Analista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          <button type="submit">Criar usuário</button>
        </form>
      </div>
    </main>
  )
}

export default CreateUserPage
