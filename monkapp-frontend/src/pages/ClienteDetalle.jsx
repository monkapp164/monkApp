import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clienteService, abonoService, ventaService } from '../services'
import { ArrowLeft, Download, Plus, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../components/common/Spinner'

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [abonos, setAbonos] = useState([])
  const [ventas, setVentas] = useState([])
  const [showAbono, setShowAbono] = useState(false)
  const [formAbono, setFormAbono] = useState({ titulo: '', monto: '', observacion: '' })
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('deudas')

  const recargar = () => {
    clienteService.obtener(id).then(r => setCliente(r.data))
    abonoService.listarPorCliente(id).then(r => setAbonos(r.data))
    ventaService.listarPorCliente(id).then(r => setVentas(r.data))
  }

  useEffect(() => { recargar() }, [id])

  const descargarPdf = async () => {
    try {
      const res = await clienteService.pdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `historial-${cliente.nombre}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF generado ✅')
    } catch { toast.error('Error generando PDF') }
  }

  const registrarAbono = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await abonoService.registrar({
        titulo: formAbono.titulo,
        monto: parseFloat(formAbono.monto),
        observacion: formAbono.observacion || null,
        clienteId: parseInt(id)
      })
      toast.success('Abono registrado ✅')
      setShowAbono(false)
      setFormAbono({ titulo: '', monto: '', observacion: '' })
      recargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar abono')
    } finally { setLoading(false) }
  }

  if (!cliente) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={() => navigate('/clientes')} style={{
          width: 36, height: 36, borderRadius: 8, border: '1.5px solid #E8E8F0',
          background: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{cliente.nombre}</h1>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {cliente.identificacion && `CC ${cliente.identificacion}`}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: '22px 24px',
                    marginBottom: 14, boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cliente.telefono && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7,
                            color: '#6B7280', fontSize: 14 }}>
                <Phone size={14} /> {cliente.telefono}
              </div>
            )}
            {cliente.correo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7,
                            color: '#6B7280', fontSize: 14 }}>
                <Mail size={14} /> {cliente.correo}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Saldo pendiente
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#EF4444' }}>
              ${Number(cliente.deudaTotal).toLocaleString('es-CO')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/ventas', { state: { clienteId: id } })} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
            border: '1.5px solid #6C63FF', borderRadius: 10, background: 'none',
            color: '#6C63FF', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            <Plus size={14} /> Registrar Venta
          </button>
          <button onClick={descargarPdf} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
            border: '1.5px solid #6C63FF', borderRadius: 10, background: 'none',
            color: '#6C63FF', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            <Download size={14} /> Descargar PDF
          </button>
          {Number(cliente.deudaTotal) > 0 && (
            <button onClick={() => setShowAbono(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              background: '#22C55E', color: '#fff', border: 'none',
              borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}>
              <Plus size={14} /> Registrar Abono
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <button onClick={() => setVista('deudas')} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
          background: vista === 'deudas' ? '#6C63FF' : 'var(--card)',
          color: vista === 'deudas' ? '#fff' : 'var(--text)',
          boxShadow: vista === 'deudas' ? '0 2px 12px rgba(108,99,255,0.3)' : '0 2px 12px rgba(108,99,255,0.07)',
          transition: 'all 0.2s'
        }}>
          Deudas
        </button>
        <button onClick={() => setVista('abonos')} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
          background: vista === 'abonos' ? '#22C55E' : 'var(--card)',
          color: vista === 'abonos' ? '#fff' : 'var(--text)',
          boxShadow: vista === 'abonos' ? '0 2px 12px rgba(34,197,94,0.3)' : '0 2px 12px rgba(108,99,255,0.07)',
          transition: 'all 0.2s'
        }}>
          Abonos
        </button>
      </div>

      {/* Ventas */}
      {vista === 'deudas' && (
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: '22px 24px',
                    marginBottom: 14, boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A2E' }}>
          Historial de Compras
        </h3>
        {ventas.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            Sin compras registradas
          </p>
        ) : ventas.map(v => (
          <div key={v.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                Venta #{v.id} - {v.fecha}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                {v.productos?.length ? `${v.productos.length} producto(s)` : 'Sin productos'}
                {v.observacion && ` · ${v.observacion}`}
              </div>
            </div>
            <span style={{ fontWeight: 800, color: '#EF4444', fontSize: 15 }}>
              -${Number(v.total).toLocaleString('es-CO')}
            </span>
          </div>
        ))}
      </div>
      )}

      {/* Abonos */}
      {vista === 'abonos' && (
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: '22px 24px',
                    boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A2E' }}>
          Historial de Abonos
        </h3>
        {abonos.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            Sin abonos registrados
          </p>
        ) : abonos.map(a => (
          <div key={a.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.titulo}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                {a.fecha}{a.observacion && ` · ${a.observacion}`}
              </div>
            </div>
            <span style={{ fontWeight: 800, color: '#22C55E', fontSize: 15 }}>
              +${Number(a.monto).toLocaleString('es-CO')}
            </span>
          </div>
        ))}
      </div>
      )}

      {/* Modal abono */}
      {showAbono && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Registrar Abono</h2>
            <form onSubmit={registrarAbono}>
              {[
                ['titulo', 'Título *', 'text', true],
                ['monto', 'Monto *', 'number', true],
                ['observacion', 'Observación (opcional)', 'text', false],
              ].map(([key, label, type, req]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                  color: 'var(--text)', marginBottom: 5 }}>{label}</label>
                  <input type={type} step={type === 'number' ? '0.01' : undefined}
                    value={formAbono[key]}
                    onChange={e => setFormAbono({ ...formAbono, [key]: e.target.value })}
                    required={req}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8F0',
                             borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ marginTop: 6, padding: '10px 12px', background: '#F0FDF4',
                            borderRadius: 8, fontSize: 13, color: '#16A34A' }}>
                Deuda actual: <strong>${Number(cliente.deudaTotal).toLocaleString('es-CO')}</strong>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowAbono(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid #E8E8F0',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '12px', background: '#22C55E', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600
                }}>{loading ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
