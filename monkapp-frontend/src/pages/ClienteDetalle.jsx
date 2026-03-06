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
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [abonoSeleccionado, setAbonoSeleccionado] = useState(null)
  const [showPagoVenta, setShowPagoVenta] = useState(false)
  const [formPagoVenta, setFormPagoVenta] = useState({ titulo: '', monto: '', observacion: '' })

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

  const registrarPagoVenta = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await abonoService.registrarPorVenta(ventaSeleccionada.id, {
        titulo: formPagoVenta.titulo,
        monto: parseFloat(formPagoVenta.monto),
        observacion: formPagoVenta.observacion || null,
        clienteId: parseInt(id)
      })
      toast.success('Pago registrado ✅')
      setShowPagoVenta(false)
      setFormPagoVenta({ titulo: '', monto: '', observacion: '' })
      setVentaSeleccionada(null) // Cerrar también el modal de detalle de venta
      recargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar pago')
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
            border: '1.5px solid var(--primary)', borderRadius: 10, background: 'none',
            color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            <Plus size={14} /> Registrar Venta
          </button>
          <button onClick={descargarPdf} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
            border: '1.5px solid var(--primary)', borderRadius: 10, background: 'none',
            color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>
            <Download size={14} /> Descargar PDF
          </button>
          {Number(cliente.deudaTotal) > 0 && (
            <button onClick={() => setShowAbono(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              background: 'var(--success)', color: '#fff', border: 'none',
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
          background: vista === 'deudas' ? 'var(--primary)' : 'var(--card)',
          color: vista === 'deudas' ? '#fff' : 'var(--text)',
          boxShadow: vista === 'deudas' ? '0 2px 12px rgba(108,99,255,0.3)' : '0 2px 12px rgba(108,99,255,0.07)',
          transition: 'all 0.2s'
        }}>
          Deudas
        </button>
        <button onClick={() => setVista('abonos')} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
          background: vista === 'abonos' ? 'var(--success)' : 'var(--card)',
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
        {/* distribuir saldo pendiente entre ventas para visualización */}
        {cliente && ventas.length > 0 && (() => {
          let remaining = Number(cliente.deudaTotal) || 0
          ventas.forEach(v => {
            const owed = Number(v.saldoPendiente || 0)
            v.displaySaldo = remaining > 0 ? Math.min(owed, remaining) : 0
            remaining -= v.displaySaldo
          })
        })()}
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A2E' }}>
          Historial de Compras
        </h3>
        {ventas.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            Sin compras registradas
          </p>
        ) : ventas.map(v => {
          // Obtener información del primer producto/detalle
          const detalles = v.detalles || v.productos || []
          const primerDetalle = detalles[0] || {}
          const nombreProducto = primerDetalle.nombreProducto || primerDetalle.nombre || 'Producto'
          const cantidadProductos = detalles.length
          
          return (
            <div key={v.id}
                 onClick={() => {
                   console.log('venta clickeada', v)
                   toast('Venta seleccionada', { duration: 1500 })
                   setVentaSeleccionada(v)
                 }}
                 style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderRadius: 12, marginBottom: 8,
              background: 'var(--bg)', border: '1px solid var(--border)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
                 onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                 onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {nombreProducto} {cantidadProductos > 1 && `+${cantidadProductos - 1} más`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {v.fecha} · {v.metodoPago || 'Sin método'}
                  {v.estado && ` · ${v.estado}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>
                  ${Number(v.total).toLocaleString('es-CO')}
                </div>
                {v.displaySaldo > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>
                    Pendiente: ${Number(v.displaySaldo).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
          <div key={a.id} onClick={() => setAbonoSeleccionado(a)} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: 'var(--bg)', border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'all 0.2s'
          }} onMouseEnter={(e) => e.target.style.boxShadow = 'var(--shadow)'} 
             onMouseLeave={(e) => e.target.style.boxShadow = 'none'}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                {a.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {a.fecha}
                {a.observacion && ` · ${a.observacion}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: 15 }}>
                +${Number(a.monto).toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal detalle venta */}
      {ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Detalles de Venta #{ventaSeleccionada.id}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {ventaSeleccionada.displaySaldo > 0 && (
                  <button onClick={() => setShowPagoVenta(true)} style={{
                    padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--success)',
                    background: 'var(--success)', color: 'white', cursor: 'pointer',
                    fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    💰 Registrar Pago
                  </button>
                )}
                <button onClick={() => setVentaSeleccionada(null)} style={{
                  width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
                  background: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                }}>×</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Información general */}
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                  Información General
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Fecha:</span>
                    <span style={{ fontWeight: 600 }}>{ventaSeleccionada.fecha}</span>
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

              {/* Productos */}
              {(ventaSeleccionada.detalles || ventaSeleccionada.productos) && (ventaSeleccionada.detalles || ventaSeleccionada.productos).length > 0 && (
                <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
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

              {/* Resumen financiero */}
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
                      <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-${Number(ventaSeleccionada.descuento).toLocaleString('es-CO')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <span style={{ fontWeight: 700 }}>Total:</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(ventaSeleccionada.total).toLocaleString('es-CO')}</span>
                  </div>
                  {(ventaSeleccionada.abonoInicial || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Abono inicial:</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>${Number(ventaSeleccionada.abonoInicial).toLocaleString('es-CO')}</span>
                    </div>
                  )}
                  {ventaSeleccionada.displaySaldo > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Saldo pendiente:</span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>${Number(ventaSeleccionada.displaySaldo).toLocaleString('es-CO')}</span>
                    </div>
                  )}
                </div>
              </div>

              {(ventaSeleccionada.concepto || ventaSeleccionada.observacion) && (
                <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                    Concepto
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                    {ventaSeleccionada.concepto || ventaSeleccionada.observacion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle abono */}
      {abonoSeleccionado && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Detalles del Abono
              </h2>
              <button onClick={() => setAbonoSeleccionado(null)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
              }}>×</button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Título</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{abonoSeleccionado.titulo}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Fecha</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{abonoSeleccionado.fecha}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Monto</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)' }}>
                      +${Number(abonoSeleccionado.monto).toLocaleString('es-CO')}
                    </div>
                  </div>
                  
                  {abonoSeleccionado.observacion && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Observación</div>
                      <div style={{ fontSize: 14, color: 'var(--text)' }}>{abonoSeleccionado.observacion}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pago venta específica */}
      {showPagoVenta && ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: '32px',
                        width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Registrar Pago - Venta #{ventaSeleccionada.id}
              </h2>
              <button onClick={() => setShowPagoVenta(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
                background: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
              }}>×</button>
            </div>

            <form onSubmit={registrarPagoVenta}>
              {[
                ['titulo', 'Concepto del pago *', 'text', true],
                ['monto', 'Monto *', 'number', true],
                ['observacion', 'Observación (opcional)', 'text', false],
              ].map(([key, label, type, req]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
                                  color: 'var(--text)', marginBottom: 5 }}>{label}</label>
                  <input type={type} step={type === 'number' ? '0.01' : undefined}
                    value={formPagoVenta[key]}
                    onChange={e => setFormPagoVenta({ ...formPagoVenta, [key]: e.target.value })}
                    required={req}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)',
                             borderRadius: 8, fontSize: 14, outline: 'none', color: 'var(--text)', background: 'var(--card)' }}
                  />
                </div>
              ))}

              {(cliente.deudaTotal && Number(cliente.deudaTotal) > 0) && (
                <div style={{ marginTop: 6, padding: '10px 12px', background: '#FEF3C7',
                              borderRadius: 8, fontSize: 13, color: '#92400E' }}>
                  Saldo pendiente de esta venta: <strong>${Number(ventaSeleccionada.displaySaldo || 0).toLocaleString('es-CO')}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowPagoVenta(false)} style={{
                  flex: 1, padding: '12px', border: '1.5px solid var(--border)',
                  borderRadius: 10, background: 'none', cursor: 'pointer', fontWeight: 600
                }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '12px', background: 'var(--success)', color: '#fff',
                  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600
                }}>{loading ? 'Registrando...' : 'Registrar Pago'}</button>
              </div>
            </form>
          </div>
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
                  flex: 1, padding: '12px', background: 'var(--success)', color: '#fff',
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
