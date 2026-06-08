import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ft_token'))
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('ft_token')
    return t ? parseJwt(t) : null
  })

  const login = useCallback((jwt) => {
    localStorage.setItem('ft_token', jwt)
    setToken(jwt)
    setUser(parseJwt(jwt))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
