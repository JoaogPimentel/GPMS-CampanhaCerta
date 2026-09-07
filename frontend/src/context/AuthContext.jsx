import { createContext, useContext, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())

  async function login(email, password) {
    const loggedUser = await authService.login({ email, password })
    setUser(loggedUser)
    return loggedUser
  }

  async function register(name, email, password) {
    const newUser = await authService.register({ name, email, password })
    setUser(newUser)
    return newUser
  }

  function logout() {
    authService.logout()
    setUser(null)
  }

  const value = { user, isAuthenticated: Boolean(user), login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
