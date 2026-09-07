import { seedUsers } from '../mocks/users'
import { nextId } from '../utils/nextId'

const USERS_KEY = 'campanhacerta_users'
const SESSION_KEY = 'campanhacerta_session'

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

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export async function login({ email, password }) {
  const users = loadUsers()
  const found = users.find((user) => user.email === email && user.password === password)

  if (!found) throw new Error('Credenciais inválidas')

  const publicUser = toPublicUser(found)
  saveSession(publicUser)
  return publicUser
}

export async function register({ name, email, password }) {
  const users = loadUsers()

  if (users.some((user) => user.email === email)) {
    throw new Error('E-mail já cadastrado')
  }

  const newUser = { id: nextId(users), name, email, password, role: 'analista' }
  saveUsers([...users, newUser])

  const publicUser = toPublicUser(newUser)
  saveSession(publicUser)
  return publicUser
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}
