const API_URL = import.meta.env.VITE_API_URL ?? ''

// Em teste, sempre usa o adaptador mock, mesmo que o dev tenha VITE_API_URL
// configurada localmente para rodar contra o backend real.
export const hasApi = Boolean(API_URL) && !import.meta.env.VITEST

const TOKEN_KEY = 'campanhacerta_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function parseError(response) {
  const body = await response.json().catch(() => null)
  return new Error(body?.error || `Erro na requisição (${response.status})`)
}

export async function apiFetch(path, { method = 'GET', json, body, headers = {} } = {}) {
  const finalHeaders = { ...headers }
  let finalBody = body

  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(json)
  }

  const token = getToken()
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { method, headers: finalHeaders, body: finalBody })

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}
