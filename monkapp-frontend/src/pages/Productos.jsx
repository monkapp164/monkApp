import { useEffect, useState } from 'react'
import { productoService } from '../services'
import { Plus, Search, Package, AlertTriangle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '',
    stock: 0, categoria: '', tieneInventario: true, stockMinimo: 5
  })

  const cargar = () => productoService.listar()
    .then(r => setProductos(r.data))
    .catch(() => toast.error('Error cargando productos'))

  useEffect(() => { cargar() }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(buscar.toLowerCase())
  )

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await productoService.crear({
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        stockMinimo: parseInt(form.stockMinimo) || 5,
      })
      toast.success('Producto creado ✅')
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', stock: 0,
                categoria: '', tieneInventario: true, stockMinimo: 5 })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.nombre || err.response?.data?.message || 'Error al guardar')
    }
  }

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      await productoService.eliminar(id)
      toast.success('Producto eliminado')
      cargar()
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Productos 📦</h1>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#6C63FF', color: '#fff', border: 'none',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-secondary)'
        }} />
        <input placeholder="Buscar productos o categorías..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          style={{ width: '100%', padding: '11px 12px 11px 38px',
                   border: '1.5px solid #E8E8F0', borderRadius: 10, fontSize: 14, outline: 'none' }}
        />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12
      }}>
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
            <Package size={44} color="var(--border)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>
              {buscar ? 'Sin resultados' : 'Aún no tienes productos'}
            </p>
          </div>
        ) : filtrados.map(p => (
          <div key={p.id} style={{
            background: 'var(--card)', borderRadius: 14, padding: '18px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            border: p.tieneInventario && p.stock <= p.stockMinimo
              ? '1.5px solid #FEF08A' : '1px solid var(--border)',
            position: 'relative'
          }}>
            <button onClick={() => eliminar(p.id, p.nombre)} style={{
              position: 'absolute', top: 10, right: 10, background: 'none',
              border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 4
            }}>
              <Trash2 size={14} />
            </button>
            <div style={{ fontWeight: 700, fontSize: 14, paddingRight: 20, marginBottom: 4 }}>
              {p.nombre}
            </div>
            {p.categoria && (
              <span style={{
                fontSize: 11, background: 'var(--primary-light)', color: '#6C63FF',
                padding: '2px 8px', borderRadius: 20, fontWeight: 600
              }}>
                {p.categoria}
              </span>
            )}
            <div style={{ marginTop: 12, display: 'flex',
                          justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#6C63FF' }}>
                ${Number(p.precio).toLocaleString('es-CO')}
              </span>
              {p.tieneInventario ? (
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: p.stock <= p.stockMinimo ? '#F59E0B' : 'var(--text-secondary)'
                }}>
                  {p.stock <= p.stockMinimo && <AlertTriangle size={11} style={{ marginRight: 2 }} />}
                  Stock: {p.stock}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Libre</span>
              )}
            </div>
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
                        width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo Producto</h2>
            <form onSubmit={guardar}>
              {[
                ['nombre', 'Nombre *', 'text', true],
                ['descripcion', 'Descripción', 'text', false],
                ['precio', 'Precio *', 'number', true],
                ['categoria', 'Categoría', 'text', false],
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <input type="checkbox" id="inv" checked={form.tieneInventario}
                  onChange={e => setForm({ ...form, tieneInventario: e.target.checked })}
                />
                <label htmlFor="inv" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Controlar inventario
                </label>
              </div>

              {form.tieneInventario && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {[['stock', 'Stock inicial'], ['stockMinimo', 'Stock mínimo']].map(([key, label]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                      color: 'var(--text)', marginBottom: 5 }}>{label}</label>
                      <input type="number" value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)',
                                 borderRadius: 8, fontSize: 14, outline: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid var(--border)',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" style={{
                  flex: 1, padding: '12px', background: '#6C63FF', color: '#fff',
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
