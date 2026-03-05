import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../services'
import { TrendingUp, TrendingDown, Users, Package, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../components/common/Spinner'

function StatCard({ titulo, valor, color, icon: Icon, prefix = '$' }) {
  return (
    <div className="stat-card" style={{
      background: 'var(--card)', borderRadius: 16, padding: '22px 24px',
      boxShadow: '0 2px 12px rgba(108,99,255,0.07)', borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {titulo}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color }}>
            {prefix}{Number(valor || 0).toLocaleString('es-CO')}
          </p>
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 12, background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    dashboardService.obtener().then(r => setData(r.data))
      .catch(() => toast.error('Error cargando dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 22 }}>
        Dashboard 📊
      </h1>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        gap: 14, marginBottom: 28
      }}>
        <StatCard titulo="Por Cobrar" valor={data?.totalPorCobrar} color="#6C63FF" icon={TrendingUp} />
        <StatCard titulo="Por Pagar" valor={data?.totalPorPagar} color="#EF4444" icon={TrendingDown} />
        <StatCard titulo="Clientes" valor={data?.totalClientes} color="#22C55E" icon={Users} prefix="" />
        <StatCard titulo="Productos" valor={data?.totalProductos} color="#F59E0B" icon={Package} prefix="" />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px',
                    boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A2E',
                     display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={17} color="#EF4444" /> Clientes con deuda
        </h2>
        {!data?.clientesConDeuda?.length ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            🎉 ¡Sin deudas pendientes!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.clientesConDeuda.map(c => (
              <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: '#FFF5F5', borderRadius: 10,
                border: '1px solid #FEE2E2'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {c.telefono || c.correo || 'Sin contacto'}
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: '#EF4444', fontSize: 15 }}>
                  ${Number(c.deudaTotal).toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
