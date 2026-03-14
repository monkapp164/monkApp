import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConfig } from '../../context/ConfigContext'
import Spinner from '../../components/common/Spinner'
import logo from '../../img/logo.png'
import logo1 from '../../img/logo1.png'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)',
  borderRadius: 10, fontSize: 15, outline: 'none', background: 'var(--card)',
  transition: 'border-color 0.2s',
}
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6
}

export default function Login() {
  const [form, setForm] = useState({ cedula: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { config } = useConfig()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.cedula, form.password)
      // Mostrar el loader al menos 5 segundos para que se vea el GIF
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('¡Bienvenido a MonkApp!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 24, padding: '44px 40px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',           
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={config?.modoOscuro ? logo1 : logo} alt="MonkApp logo" style={{ width: '200%', height: '200%', objectFit: 'contain' }} />
          </div>
         
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Cédula</label>
            <input type="text" placeholder="Tu número de cédula"
              value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })}
              required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Contraseña (4 dígitos)</label>
            <input type="password" placeholder="••••" maxLength={4}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#A5A0FF' : '#6C63FF',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {loading ? <Spinner size={20} useGif /> : 'Iniciar sesión'}
          </button>
        </form>
        {loading && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              padding: 28, borderRadius: 999,
              background: 'radial-gradient(circle at center, rgb(255, 255, 255), rgb(255, 255, 255) 60%, transparent 85%)',
              boxShadow: '0 0 60px rgb(221, 221, 221)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Spinner useGif size={200} />
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-secondary)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
