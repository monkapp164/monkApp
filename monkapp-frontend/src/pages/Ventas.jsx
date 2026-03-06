import { useEffect, useState, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ventaService, clienteService, productoService } from '../services'
import { Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const METODOS = ['EFECTIVO','TARJETA','TRANSFERENCIA','NEQUI','DAVIPLATA','OTRO']

const badgeColor = {
  ACTIVA:  { bg: 'var(--primary-light)', color: 'var(--primary)' },
  PAGADA:  { bg: '#DCFCE7', color: '#16A34A' },
  ANULADA: { bg: 'var(--primary-light)', color: 'var(--text-secondary)' },
}

export default function Ventas() {
  const location = useLocation()
  const { clienteId } = useParams()
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [clienteVenta, setClienteVenta] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mapa de clientes por ID para búsqueda rápida
  const clientesMap = useMemo(() => Object.fromEntries(clientes.map(c => [c.id, c])), [clientes])

  // distribute pending saldo per cliente so total deuda controls display
  const distributedVentas = useMemo(() => {
    const remainingMap = {}
    clientes.forEach(c => {
      remainingMap[c.id] = Number(c.deudaTotal) || 0
    })
    return ventas.map(v => {
      const owed = Number(v.saldoPendiente || 0)
      const rem = remainingMap[v.clienteId] || 0
      const displaySaldo = rem > 0 ? Math.min(owed, rem) : 0
      remainingMap[v.clienteId] = Math.max(0, rem - displaySaldo)
      return { ...v, displaySaldo }
    })
  }, [ventas, clientes])

  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState('CON_INVENTARIO')
  const [items, setItems] = useState([{ productoId: '', nombreProducto: '', precioUnitario: '', cantidad: 1 }])
  const [form, setForm] = useState({
    metodoPago: 'EFECTIVO', clienteId: '', abonoInicial: '',
    descuento: '', concepto: '', numeroCuotas: 1
  })

  const cargar = () => ventaService.listar().then(r => setVentas(Array.isArray(r.data) ? r.data : [])).catch(() => setVentas([]))

  const cargarClienteYVentas = async (id) => {
    setLoading(true)
    try {
      const [ventasRes, clienteRes] = await Promise.all([
        ventaService.listarPorCliente(id),
        clienteService.obtener(id),
      ])
      setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : [])
      setCliente(clienteRes.data)
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar datos del cliente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    clienteService.listar().then(r => setClientes(r.data))
    productoService.listar().then(r => setProductos(r.data))
    
    if (clienteId) {
      cargarClienteYVentas(clienteId)
    } else {
      cargar()
    }
  }, [clienteId])

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
      if (clienteId) {
        cargarClienteYVentas(clienteId)
      } else {
        cargar()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    }
  }

  const abrirDetalle = async (venta) => {
    setVentaSeleccionada(venta)
    // Intenta obtener el cliente si existe clienteId
    if (venta.clienteId) {
      try {
        const { data } = await clienteService.obtener(venta.clienteId)
        setClienteVenta(data)
      } catch (e) {
        console.error('Error al obtener cliente:', e)
        setClienteVenta(null)
      }
    } else {
      console.warn('La venta no tiene clienteId:', venta)
      setClienteVenta(null)
    }
  }

  const cerrarDetalle = () => {
    setVentaSeleccionada(null)
    setClienteVenta(null)
  }

  const sel = { padding: '9px 10px', border: '1.5px solid var(--border)',
                borderRadius: 8, fontSize: 13, outline: 'none', width: '100%' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
          {cliente ? `Ventas de ${cliente.nombre}` : 'Ventas 🛒'}
        </h1>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: 'var(--primary)', color: '#fff', border: 'none',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>
          <Plus size={16} /> Nueva Venta
        </button>
      </div>

      {/* Información del cliente si está filtrando */}
      {cliente && (
        <div style={{
          background: 'var(--primary-light)', borderRadius: 12, padding: '16px',
          marginBottom: 20, border: '1px solid var(--primary)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Nombre</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{cliente.nombre}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Teléfono</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{cliente.telefono || '-'}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Correo</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{cliente.correo || '-'}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Deuda Total</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: cliente.deudaTotal > 0 ? '#EF4444' : '#22C55E' }}>
                ${Number(cliente.deudaTotal || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.isArray(ventas) && ventas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={44} color="var(--border)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14 }}>Sin ventas registradas</p>
          </div>
        ) : Array.isArray(distributedVentas) ? distributedVentas.map(v => {
          const bc = badgeColor[v.estado] || badgeColor.ACTIVA
          return (
            <div key={v.id}
                 onClick={() => abrirDetalle(v)}
                 style={{
              background: 'var(--card)', borderRadius: 12, padding: '14px 16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
                 onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.1)'}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {v.concepto || `Venta #${v.id}`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {v.fecha} · {v.metodoPago}
                  {v.clienteId && ` · ${clientesMap[v.clienteId]?.nombre}`}  {/* Cambiado: usar clientesMap */}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>
                  ${Number(v.total).toLocaleString('es-CO')}
                </div>
                {Number(v.displaySaldo) > 0 && (
                  <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 2 }}>
                    Pendiente: ${Number(v.displaySaldo).toLocaleString('es-CO')}
                  </div>
                )}
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                  background: bc.bg, color: bc.color
                }}>{v.estado}</span>
              </div>
            </div>
          )
        }) : null}
      </div>

      {/* details modal for selected sale */}
      {ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 210, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Detalles de Venta #{ventaSeleccionada.id}
              </h2>
              <button onClick={cerrarDetalle} style={{
                width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
              }}>×</button>
            </div>

            {/* general info */}
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Información General
              </h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fecha:</span>
                  <span style={{ fontWeight: 600 }}>{ventaSeleccionada.fecha}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cliente:</span>
                  <span style={{ fontWeight: 600 }}>
                    {clienteVenta ? clienteVenta.nombre : (ventaSeleccionada.clienteId ? clientesMap[ventaSeleccionada.clienteId]?.clienteNombre : 'Sin cliente')}  {/* Cambiado: usar clienteVenta o clientesMap */}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tipo:</span>
                  <span style={{ fontWeight: 600 }}>{ventaSeleccionada.tipoVenta === 'CON_INVENTARIO' ? 'Con productos' : 'Venta libre'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Método de pago:</span>
                  <span style={{ fontWeight: 600 }}>{ventaSeleccionada.metodoPago || 'No especificado'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                  <span style={{ fontWeight: 600, color: ventaSeleccionada.estado === 'PAGADA' ? 'var(--success)' : 'var(--warning)' }}>
                    {ventaSeleccionada.estado || 'ACTIVA'}
                  </span>
                </div>
                {ventaSeleccionada.numeroCuotas && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cuotas:</span>
                    <span style={{ fontWeight: 600 }}>{ventaSeleccionada.numeroCuotas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* info del cliente ampliada */}
            {clienteVenta && (
              <div style={{ background: 'var(--primary-light)', padding: 16, borderRadius: 12, border: '1px solid var(--primary)', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                  Información del Cliente
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Identificación:</span>
                    <span style={{ fontWeight: 600 }}>{clienteVenta.identificacion || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Teléfono:</span>
                    <span style={{ fontWeight: 600 }}>{clienteVenta.telefono || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Correo:</span>
                    <span style={{ fontWeight: 600 }}>{clienteVenta.correo || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Deuda Total:</span>
                    <span style={{ fontWeight: 600, color: clienteVenta.deudaTotal > 0 ? '#EF4444' : '#22C55E' }}>
                      ${Number(clienteVenta.deudaTotal || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* products list */}
            {(ventaSeleccionada.detalles || ventaSeleccionada.productos) && (ventaSeleccionada.detalles || ventaSeleccionada.productos).length > 0 && (
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                  Productos
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(ventaSeleccionada.detalles || ventaSeleccionada.productos).map((detalle, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--card)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{detalle.nombreProducto || detalle.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Cantidad: {detalle.cantidad}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          ${Number(detalle.precioUnitario || detalle.precio).toLocaleString('es-CO')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          Subtotal: ${((detalle.precioUnitario || detalle.precio) * detalle.cantidad).toLocaleString('es-CO')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* financial summary */}
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Resumen Financiero
              </h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>${Number(ventaSeleccionada.total + (ventaSeleccionada.descuento || 0)).toLocaleString('es-CO')}</span>
                </div>
                {(ventaSeleccionada.descuento || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Descuento:</span>
                    <span style={{ fontWeight: 600 }}>${Number(ventaSeleccionada.descuento).toLocaleString('es-CO')}</span>
                  </div>
                )}
                {ventaSeleccionada.abonoInicial && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Abono inicial:</span>
                    <span style={{ fontWeight: 600 }}>${Number(ventaSeleccionada.abonoInicial).toLocaleString('es-CO')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
                  <span style={{ fontWeight: 600 }}>${Number(ventaSeleccionada.total).toLocaleString('es-CO')}</span>
                </div>
                {Number(ventaSeleccionada.saldoPendiente) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Saldo pendiente:</span>
                    <span style={{ fontWeight: 600, color: 'var(--warning)' }}>${Number(ventaSeleccionada.saldoPendiente).toLocaleString('es-CO')}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

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
                  flex: 1, padding: '9px', border: `2px solid ${tipo === t ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 10, background: tipo === t ? 'var(--primary-light)' : 'var(--card)',
                  color: tipo === t ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer',
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
                  style={{ fontSize: 13, color: 'var(--primary)', background: 'none',
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
                  <strong style={{ color: 'var(--primary)' }}>${Math.max(0,total).toLocaleString('es-CO')}</strong>
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
                  flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff',
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