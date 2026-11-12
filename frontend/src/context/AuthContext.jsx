import { createContext, useContext, useEffect, useState } from 'react'
import { SESSION_EXPIRED_EVENT } from '../services/apiClient'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())

  // Token expirado/inválido: encerra a sessão para o ProtectedRoute mandar
  // o usuário de volta ao login, em vez de deixá-lo em telas que só dão erro.
  useEffect(() => {
    function handleSessionExpired() {
      authService.logout()
      setUser(null)
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

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
