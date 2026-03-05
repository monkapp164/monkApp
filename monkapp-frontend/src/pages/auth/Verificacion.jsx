import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function Verificacion() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const correo = location.state?.correo || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.verificar({ correo, codigo })
      toast.success('¡Cuenta verificada! Ya puedes iniciar sesión 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  const reenviar = async () => {
    try {
      await authService.reenviarCodigo(correo)
      toast.success('Nuevo código enviado ✉️')
    } catch {
      toast.error('Error al reenviar')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 24, padding: '44px 36px',
        width: '100%', maxWidth: 400, textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Verifica tu correo
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 30, lineHeight: 1.6 }}>
          Enviamos un código de 6 dígitos a<br />
          <strong style={{ color: '#6C63FF' }}>{correo || 'tu correo'}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text" maxLength={6} placeholder="000000"
            value={codigo}
            onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
            required
            style={{
              width: '100%', padding: '16px', fontSize: 36, fontWeight: 800,
              textAlign: 'center', letterSpacing: 14,
              border: '2px dashed #6C63FF', borderRadius: 14, outline: 'none',
              color: '#6C63FF', background: 'var(--primary-light)', marginBottom: 20
            }}
          />
          <button type="submit" disabled={loading || codigo.length < 6} style={{
            width: '100%', padding: '14px',
            background: loading || codigo.length < 6 ? '#A5A0FF' : '#6C63FF',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700,
            cursor: loading || codigo.length < 6 ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Verificando...' : 'Verificar cuenta'}
          </button>
        </form>

        <button onClick={reenviar} style={{
          marginTop: 16, background: 'none', border: 'none',
          color: '#6C63FF', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          textDecoration: 'underline'
        }}>
          ¿No recibiste el código? Reenviar
        </button>
      </div>
    </div>
  )
}
