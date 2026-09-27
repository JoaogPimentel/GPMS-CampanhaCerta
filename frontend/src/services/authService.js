import { seedUsers } from '../mocks/users'
import { nextId } from '../utils/nextId'
import { apiFetch, hasApi, setToken } from './apiClient'

const USERS_KEY = 'campanhacerta_users'
const SESSION_KEY = 'campanhacerta_session'

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

// ---- adaptador mock (localStorage) — usado em testes e sem backend configurado ----

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (raw) return JSON.parse(raw)

  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
  return seedUsers
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublicUser(user) {
  const { password: _password, ...publicUser } = user
  return publicUser
}

async function mockLogin({ email, password }) {
  const users = loadUsers()
  const found = users.find((user) => user.email === email && user.password === password)

  if (!found) throw new Error('Credenciais inválidas')

  const publicUser = toPublicUser(found)
  saveSession(publicUser)
  return publicUser
}

async function mockCreateUser({ name, email, password, role = 'analista' }) {
  const users = loadUsers()

  if (users.some((user) => user.email === email)) {
    throw new Error('E-mail já cadastrado')
  }

  const newUser = { id: nextId(users), name, email, password, role }
  saveUsers([...users, newUser])

  return toPublicUser(newUser)
}

// ---- adaptador HTTP — usado quando VITE_API_URL aponta para o backend Flask ----

async function httpLogin({ email, password }) {
  const { user, token } = await apiFetch('/auth/login', { method: 'POST', json: { email, password } })
  setToken(token)
  saveSession(user)
  return user
}

async function httpCreateUser({ name, email, password, role = 'analista' }) {
  const { user } = await apiFetch('/auth/users', {
    method: 'POST',
    json: { name, email, password, role },
  })
  return user
}

export async function login(credentials) {
  return hasApi ? httpLogin(credentials) : mockLogin(credentials)
}

// Restrito a administradores (RF01/RF09) — não afeta a sessão de quem chama.
export async function createUser(data) {
  return hasApi ? httpCreateUser(data) : mockCreateUser(data)
}

export function logout() {
  setToken(null)
  localStorage.removeItem(SESSION_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}
