import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mk_token')
    const u = localStorage.getItem('mk_usuario')
    if (token && u) {
      try { setUsuario(JSON.parse(u)) } catch { localStorage.clear() }
    }
    setCargando(false)
  }, [])

  const login = async (cedula, password) => {
    const { data } = await api.post('/auth/login', { cedula, password })
    localStorage.setItem('mk_token', data.token)
    localStorage.setItem('mk_usuario', JSON.stringify({
      cedula: data.cedula, nombre: data.nombre, correo: data.correo,
    }))
    setUsuario({ cedula: data.cedula, nombre: data.nombre, correo: data.correo })
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
