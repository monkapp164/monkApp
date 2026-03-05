import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ventaService, clienteService, productoService } from '../services'
import { Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const METODOS = ['EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI','DAVIPLATA','OTRO']

const badgeColor = {
  ACTIVA:  { bg: '#EEF2FF', color: '#6C63FF' },
  PAGADA:  { bg: '#DCFCE7', color: '#16A34A' },
  ANULADA: { bg: 'var(--primary-light)', color: 'var(--text-secondary)' },
}

export default function Ventas() {
  const location = useLocation()
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState('CON_INVENTARIO')
  const [items, setItems] = useState([{ productoId: '', nombreProducto: '', precioUnitario: '', cantidad: 1 }])
  const [form, setForm] = useState({
    metodoPago: 'EFECTIVO', clienteId: '', abonoInicial: '',
    descuento: '', concepto: '', numeroCuotas: 1
  })

  const cargar = () => ventaService.listar().then(r => setVentas(r.data))

  useEffect(() => {
    cargar()
    clienteService.listar().then(r => setClientes(r.data))
    productoService.listar().then(r => setProductos(r.data))
  }, [])

  useEffect(() => {
    if (location.state?.clienteId) {
      setForm(prev => ({ ...prev, clienteId: location.state.clienteId }))
    }
  }, [location.state])

  const total = items.reduce((acc, it) => {
    return acc + (parseFloat(it.precioUnitario) || 0) * (parseInt(it.cantidad) || 0)
  }, 0) - (parseFloat(form.descuento) || 0)

  const saldo = Math.max(0, total - (parseFloat(form.abonoInicial) || 0))

  const updateItem = (i, key, val) => {
    const next = [...items]
    next[i][key] = val
    if (tipo === 'CON_INVENTARIO' && key === 'productoId') {
      const prod = productos.find(p => p.id === parseInt(val))
      if (prod) {
        next[i].nombreProducto = prod.nombre
        next[i].precioUnitario = prod.precio
      }
    }
    setItems(next)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await ventaService.crear({
        ...form,
        tipoVenta: tipo,
        clienteId: form.clienteId ? parseInt(form.clienteId) : null,
        abonoInicial: parseFloat(form.abonoInicial) || 0,
        descuento: parseFloat(form.descuento) || 0,
        numeroCuotas: parseInt(form.numeroCuotas) || 1,
        detalles: items.map(it => ({
          productoId: tipo === 'CON_INVENTARIO' ? parseInt(it.productoId) : null,
          nombreProducto: it.nombreProducto,
          precioUnitario: parseFloat(it.precioUnitario),
          cantidad: parseInt(it.cantidad),
        }))
      })
      toast.success('Venta registrada ✅')
      setShowForm(false)
      setItems([{ productoId: '', nombreProducto: '', precioUnitario: '', cantidad: 1 }])
      setForm({ metodoPago:'EFECTIVO', clienteId:'', abonoInicial:'', descuento:'', concepto:'', numeroCuotas:1 })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    }
  }

  const sel = { padding: '9px 10px', border: '1.5px solid var(--border)',
                borderRadius: 8, fontSize: 13, outline: 'none', width: '100%' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Ventas 🛒</h1>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#6C63FF', color: '#fff', border: 'none',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          <Plus size={16} /> Nueva Venta
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ventas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={44} color="var(--border)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>Sin ventas registradas</p>
          </div>
        ) : ventas.map(v => {
          const bc = badgeColor[v.estado] || badgeColor.ACTIVA
          return (
            <div key={v.id} style={{
              background: 'var(--card)', borderRadius: 12, padding: '14px 16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {v.concepto || `Venta #${v.id}`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {v.fecha} · {v.metodoPago}
                  {v.cliente && ` · ${v.cliente.nombre}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#6C63FF', fontSize: 15 }}>
                  ${Number(v.total).toLocaleString('es-CO')}
                </div>
                {Number(v.saldoPendiente) > 0 && (
                  <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 2 }}>
                    Pendiente: ${Number(v.saldoPendiente).toLocaleString('es-CO')}
                  </div>
                )}
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                  background: bc.bg, color: bc.color
                }}>{v.estado}</span>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 12
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '26px',
                        width: '100%', maxWidth: 560, maxHeight: '94vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Nueva Venta</h2>

            {/* Tipo */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {[['CON_INVENTARIO','📦 Con productos'], ['LIBRE','✏️ Venta libre']].map(([t, label]) => (
                <button key={t} onClick={() => {
                  setTipo(t)
                  setItems([{ productoId:'', nombreProducto:'', precioUnitario:'', cantidad:1 }])
                }} style={{
                  flex: 1, padding: '9px', border: `2px solid ${tipo === t ? '#6C63FF' : 'var(--border)'}`,
                  borderRadius: 10, background: tipo === t ? 'var(--primary-light)' : 'var(--card)',
                  color: tipo === t ? '#6C63FF' : 'var(--text-secondary)', cursor: 'pointer',
                  fontWeight: 600, fontSize: 13,
                }}>{label}</button>
              ))}
            </div>

            <form onSubmit={guardar}>
              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                display: 'block', marginBottom: 8 }}>Productos / Servicios</label>
                {items.map((it, i) => (
                  <div key={i} style={{ display: 'grid', gap: 6, marginBottom: 8,
                    gridTemplateColumns: tipo === 'CON_INVENTARIO' ? '2fr 1fr 80px' : '2fr 1fr 80px' }}>
                    {tipo === 'CON_INVENTARIO' ? (
                      <select value={it.productoId}
                        onChange={e => updateItem(i, 'productoId', e.target.value)}
                        required style={sel}>
                        <option value="">Seleccionar producto</option>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — ${Number(p.precio).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input placeholder="Nombre del producto/servicio"
                        value={it.nombreProducto}
                        onChange={e => updateItem(i, 'nombreProducto', e.target.value)}
                        required style={sel} />
                    )}
                    <input type="number" placeholder="Precio" step="0.01"
                      value={it.precioUnitario}
                      onChange={e => updateItem(i, 'precioUnitario', e.target.value)}
                      required style={sel} />
                    <input type="number" placeholder="Cant" min={1}
                      value={it.cantidad}
                      onChange={e => updateItem(i, 'cantidad', e.target.value)}
                      required style={sel} />
                  </div>
                ))}
                <button type="button"
                  onClick={() => setItems([...items, { productoId:'', nombreProducto:'', precioUnitario:'', cantidad:1 }])}
                  style={{ fontSize: 13, color: '#6C63FF', background: 'none',
                           border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  + Agregar ítem
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  ['Método de pago', 'metodoPago', 'select'],
                  ['Cliente', 'clienteId', 'clientes'],
                  ['Descuento ($)', 'descuento', 'number'],
                  ['Abono inicial ($)', 'abonoInicial', 'number'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                    display: 'block', marginBottom: 5 }}>{label}</label>
                    {type === 'select' ? (
                      <select value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={sel}>
                        {METODOS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    ) : type === 'clientes' ? (
                      <select value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={sel}>
                        <option value="">Sin cliente</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    ) : (
                      <input type="number" step="0.01" placeholder="0"
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        style={sel} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                display: 'block', marginBottom: 5 }}>Concepto / Observación</label>
                <input value={form.concepto}
                  onChange={e => setForm({ ...form, concepto: e.target.value })}
                  placeholder="Descripción de la venta" style={sel} />
              </div>

              {/* Resumen */}
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px',
                            marginBottom: 18, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <strong>${(total + (parseFloat(form.descuento)||0)).toLocaleString('es-CO')}</strong>
                </div>
                {parseFloat(form.descuento) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Descuento</span>
                    <span style={{ color: '#22C55E' }}>
                      -${Number(parseFloat(form.descuento)||0).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                              borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
                  <strong>Total</strong>
                  <strong style={{ color: '#6C63FF' }}>${Math.max(0,total).toLocaleString('es-CO')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Saldo pendiente</span>
                  <strong style={{ color: saldo > 0 ? '#EF4444' : '#22C55E' }}>
                    ${saldo.toLocaleString('es-CO')}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid var(--border)',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" style={{
                  flex: 1, padding: '12px', background: '#6C63FF', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600
                }}>Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
