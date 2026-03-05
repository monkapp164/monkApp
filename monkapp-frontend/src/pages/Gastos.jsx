import { useEffect, useState } from 'react'
import { gastoService } from '../services'
import { Plus, Wallet, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const METODOS = ['EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI','DAVIPLATA','OTRO']

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    categoria: '', valor: '', valorPagado: '',
    metodoPago: 'EFECTIVO', descripcion: ''
  })

  const cargar = () => gastoService.listar().then(r => setGastos(r.data))
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await gastoService.crear({
        ...form,
        valor: parseFloat(form.valor),
        valorPagado: form.valorPagado ? parseFloat(form.valorPagado) : undefined,
      })
      toast.success('Gasto registrado ✅')
      setShowForm(false)
      setForm({ categoria:'', valor:'', valorPagado:'', metodoPago:'EFECTIVO', descripcion:'' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return
    try {
      await gastoService.eliminar(id)
      toast.success('Gasto eliminado')
      cargar()
    } catch { toast.error('Error al eliminar') }
  }

  const totalPorPagar = gastos.reduce((acc, g) => acc + Number(g.saldoPendiente || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Gastos 💸</h1>
          {totalPorPagar > 0 && (
            <div style={{ fontSize: 13, color: '#EF4444', fontWeight: 600, marginTop: 2 }}>
              Por pagar: ${totalPorPagar.toLocaleString('es-CO')}
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#EF4444', color: '#fff', border: 'none',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          <Plus size={16} /> Nuevo Gasto
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gastos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)' }}>
            <Wallet size={44} color="var(--border)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>Sin gastos registrados</p>
          </div>
        ) : gastos.map(g => (
          <div key={g.id} style={{
            background: 'var(--card)', borderRadius: 12, padding: '14px 16px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', border: '1px solid var(--border)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{g.categoria}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {g.fecha} · {g.metodoPago}
                {g.descripcion && ` · ${g.descripcion}`}
              </div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 12 }}>
              <div style={{ fontWeight: 800, color: '#EF4444', fontSize: 15 }}>
                ${Number(g.valor).toLocaleString('es-CO')}
              </div>
              {Number(g.saldoPendiente) > 0 && (
                <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                  Pendiente: ${Number(g.saldoPendiente).toLocaleString('es-CO')}
                </div>
              )}
            </div>
            <button onClick={() => eliminar(g.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--border)', padding: 4
            }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 16
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '30px',
                        width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo Gasto</h2>
            <form onSubmit={guardar}>
              {[
                ['categoria', 'Categoría *', 'text', true],
                ['valor', 'Valor total *', 'number', true],
                ['valorPagado', 'Valor pagado (vacío = pago total)', 'number', false],
                ['descripcion', 'Descripción', 'text', false],
              ].map(([key, label, type, req]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                  color: 'var(--text)', marginBottom: 5 }}>{label}</label>
                  <input type={type} step={type === 'number' ? '0.01' : undefined}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={req}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)',
                             borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                color: 'var(--text)', marginBottom: 5 }}>Método de pago</label>
                <select value={form.metodoPago}
                  onChange={e => setForm({ ...form, metodoPago: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8F0',
                           borderRadius: 8, fontSize: 14, outline: 'none' }}>
                  {METODOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid #E8E8F0',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" style={{
                  flex: 1, padding: '12px', background: '#EF4444', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600
                }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
