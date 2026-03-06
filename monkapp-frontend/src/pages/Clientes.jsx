import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clienteService } from '../services'
import { Plus, Search, User, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8F0',
  borderRadius: 8, fontSize: 14, outline: 'none',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [buscar, setBuscar] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', identificacion: '', telefono: '', correo: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const cargar = () => clienteService.listar()
    .then(r => setClientes(r.data))
    .catch(() => toast.error('Error cargando clientes'))

  useEffect(() => { cargar() }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (c.telefono || '').includes(buscar)
  )

  const guardar = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clienteService.crear(form)
      toast.success('Cliente creado ✅')
      setShowForm(false)
      setForm({ nombre: '', identificacion: '', telefono: '', correo: '' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.nombre || err.response?.data?.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Clientes 👥</h1>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10,
          cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-secondary)'
        }} />
        <input placeholder="Buscar por nombre o teléfono..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          style={{ ...inputStyle, padding: '11px 12px 11px 38px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)' }}>
            <User size={44} color="#E8E8F0" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>
              {buscar ? 'Sin resultados' : 'Aún no tienes clientes'}
            </p>
          </div>
        ) : filtrados.map(c => (
          <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)}
            style={{
              background: 'var(--card)', borderRadius: 12, padding: '14px 16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', cursor: 'pointer',
              border: '1px solid var(--border)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'var(--primary)', fontSize: 15, flexShrink: 0
              }}>
                {c.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                  {c.telefono || c.correo || 'Sin contacto'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Number(c.deudaTotal) > 0 && (
                <span style={{
                  background: '#FEE2E2', color: '#EF4444', padding: '3px 10px',
                  borderRadius: 20, fontSize: 12, fontWeight: 700
                }}>
                  ${Number(c.deudaTotal).toLocaleString('es-CO')}
                </span>
              )}
              <ChevronRight size={15} color="#D1D5DB" />
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Nuevo Cliente</h2>
            <form onSubmit={guardar}>
              {[
                ['nombre', 'Nombre *', 'text', true],
                ['identificacion', 'Identificación', 'text', false],
                ['telefono', 'Teléfono', 'tel', false],
                ['correo', 'Correo electrónico', 'email', false],
              ].map(([key, label, type, required]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                  color: 'var(--text)', marginBottom: 5 }}>{label}</label>
                  <input type={type} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={required} style={inputStyle} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid #E8E8F0',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600
                }}>{loading ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
