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

  function logout() {
    authService.logout()
    setUser(null)
  }

  const value = { user, isAuthenticated: Boolean(user), login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
