import { beforeEach, describe, expect, it } from 'vitest'
import { getStoredUser, login, logout, register } from './authService'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('autentica um usuário seed com credenciais válidas', async () => {
      const user = await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

      expect(user).toMatchObject({ email: 'admin@campanhacerta.com', role: 'admin' })
      expect(user).not.toHaveProperty('password')
    })

    it('rejeita quando a senha está incorreta', async () => {
      await expect(
        login({ email: 'admin@campanhacerta.com', password: 'senha-errada' }),
      ).rejects.toThrow('Credenciais inválidas')
    })

    it('rejeita quando o e-mail não existe', async () => {
      await expect(
        login({ email: 'inexistente@campanhacerta.com', password: 'qualquer' }),
      ).rejects.toThrow('Credenciais inválidas')
    })

    it('persiste a sessão do usuário autenticado', async () => {
      await login({ email: 'analista@campanhacerta.com', password: 'analista123' })

      expect(getStoredUser()).toMatchObject({
        email: 'analista@campanhacerta.com',
        role: 'analista',
      })
    })
  })

  describe('register', () => {
    it('cadastra um novo usuário com papel analista por padrão', async () => {
      const user = await register({
        name: 'Novo Usuário',
        email: 'novo@campanhacerta.com',
        password: 'senha123',
      })

      expect(user).toMatchObject({
        name: 'Novo Usuário',
        email: 'novo@campanhacerta.com',
        role: 'analista',
      })
      expect(user).not.toHaveProperty('password')
    })

    it('permite login imediatamente após o cadastro', async () => {
      await register({
        name: 'Novo Usuário',
        email: 'novo@campanhacerta.com',
        password: 'senha123',
      })

      const user = await login({ email: 'novo@campanhacerta.com', password: 'senha123' })

      expect(user.email).toBe('novo@campanhacerta.com')
    })

    it('rejeita cadastro com e-mail já existente', async () => {
      await expect(
        register({ name: 'Duplicado', email: 'admin@campanhacerta.com', password: 'outrasenha' }),
      ).rejects.toThrow('E-mail já cadastrado')
    })
  })

  describe('logout', () => {
    it('remove a sessão armazenada', async () => {
      await login({ email: 'admin@campanhacerta.com', password: 'admin123' })

      logout()

      expect(getStoredUser()).toBeNull()
    })
  })

  describe('getStoredUser', () => {
    it('retorna null quando não há sessão ativa', () => {
      expect(getStoredUser()).toBeNull()
    })
  })
})
