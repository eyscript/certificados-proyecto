import { createContext, useContext, useState, useEffect } from 'react'

// Creamos el contexto
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Cargamos de localStorage en vez de sessionStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  // Decodificar y poblar `user` cada vez que cambie el token
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token)
      console.log("Token detectado:", token)
      console.log("Token decodificado:", decoded)
      setUser(decoded)
    } else {
      console.log("No hay token")
      setUser(null)
    }
  }, [token])

  // Función de login: guarda en localStorage y actualiza estado
  const login = (jwt) => {
    localStorage.setItem('token', jwt)
    setToken(jwt)
  }

  // Logout: limpia localStorage y estado
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Decode JWT (payload base64)
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      console.error("Error parsing JWT:", e)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook auxiliar para consumir el contexto
export const useAuth = () => useContext(AuthContext)
