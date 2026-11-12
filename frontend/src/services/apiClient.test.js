import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_EXPIRED_EVENT, apiFetch, getToken, setToken } from './apiClient'

function stubFetch(status, body) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    })),
  )
}

describe('apiFetch', () => {
  let onExpired

  beforeEach(() => {
    localStorage.clear()
    onExpired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
  })

  afterEach(() => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    vi.unstubAllGlobals()
  })

  it('descarta o token e avisa a sessão expirada quando a API responde 401', async () => {
    setToken('token-expirado')
    stubFetch(401, { error: 'Sessão expirada' })

    await expect(apiFetch('/campaigns')).rejects.toThrow('Sessão expirada')

    expect(getToken()).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
  })

  it('não dispara o evento num 401 sem token (ex.: senha errada no login)', async () => {
    stubFetch(401, { error: 'Credenciais inválidas' })

    await expect(apiFetch('/auth/login', { method: 'POST', json: {} })).rejects.toThrow(
      'Credenciais inválidas',
    )

    expect(onExpired).not.toHaveBeenCalled()
  })

  it('mantém o token em erros que não são de autenticação', async () => {
    setToken('token-valido')
    stubFetch(403, { error: 'Ação restrita ao perfil administrador' })

    await expect(apiFetch('/campaigns/1', { method: 'DELETE' })).rejects.toThrow()

    expect(getToken()).toBe('token-valido')
    expect(onExpired).not.toHaveBeenCalled()
  })
})
