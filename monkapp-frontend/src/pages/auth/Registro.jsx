import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import logo from '../../img/logo.png'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)',
  borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--card)',
}

export default function Registro() {
  const [form, setForm] = useState({ cedula: '', nombre: '', correo: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(form.password)) {
      toast.error('La contraseña debe ser de exactamente 4 dígitos numéricos')
      return
    }
    setLoading(true)
    try {
      await authService.registrar(form)
      toast.success('¡Registro exitoso! Revisa tu correo')
      navigate('/verificar', { state: { correo: form.correo } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error en el registro')
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
        background: 'var(--card)', borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={logo} alt="MonkApp logo" style={{ width: '200%', height: '200%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, marginTop:'50px'}}>
            Crear cuenta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Empieza a organizar tu negocio</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            ['cedula', 'Cédula *', 'text', 'Ej: 1234567890'],
            ['nombre', 'Nombre completo *', 'text', 'Tu nombre'],
            ['correo', 'Correo electrónico *', 'email', 'tu@correo.com'],
          ].map(([key, label, type, placeholder]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                              color: 'var(--text)', marginBottom: 5 }}>
                {label}
              </label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => set(key, e.target.value)} required style={inputStyle} />
            </div>
          ))}

          <div style={{ marginBottom: 26 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                            color: 'var(--text)', marginBottom: 5 }}>
              Contraseña (4 dígitos) *
            </label>
            <input type="password" maxLength={4} placeholder="••••"
              value={form.password} onChange={e => set('password', e.target.value)}
              required style={{ ...inputStyle, letterSpacing: 10, textAlign: 'center', fontSize: 20 }} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? '#A5A0FF' : '#6C63FF',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
