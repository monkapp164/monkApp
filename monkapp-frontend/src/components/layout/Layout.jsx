import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../img/logo.png'
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  Wallet, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes',    icon: Users,          label: 'Clientes' },
  { to: '/productos',   icon: Package,         label: 'Productos' },
  { to: '/ventas',      icon: ShoppingCart,    label: 'Ventas' },
  { to: '/gastos',      icon: Wallet,          label: 'Gastos' },
  { to: '/configuracion', icon: Settings,      label: 'Configuración' },
]

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 99
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 248, background: 'var(--card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        height: '100vh', top: 0, zIndex: 100,
        left: open ? 0 : -248,
        transition: 'left 0.28s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '4px 0 24px rgba(108,99,255,0.10)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20
            }}>
              <img src={logo} alt="MonkApp logo" style={{ width: '80%', height: '80%', objectFit: 'contain', borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)', lineHeight: 1.1 }}>
                MonkApp
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                Tu negocio organizado
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 14px', borderRadius: 10, marginBottom: 3,
                textDecoration: 'none', fontWeight: isActive ? 700 : 500,
                fontSize: 14, transition: 'all 0.15s',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', marginBottom: 6
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nombre}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
              CC {usuario?.cedula}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10, border: 'none',
            background: 'transparent', color: 'var(--danger)', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
          }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--card)', borderBottom: '1px solid var(--border)',
          padding: '0 20px', height: 58,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button onClick={() => setOpen(o => !o)} style={{
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1.5px solid var(--border)', cursor: 'pointer',
            color: 'var(--text-secondary)', transition: 'background 0.15s'
          }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logo} alt="MonkApp logo" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>MonkApp</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
