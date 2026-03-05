import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/auth/Login'
import Registro from '../pages/auth/Registro'
import Verificacion from '../pages/auth/Verificacion'
import Dashboard from '../pages/Dashboard'
import Clientes from '../pages/Clientes'
import ClienteDetalle from '../pages/ClienteDetalle'
import Productos from '../pages/Productos'
import Ventas from '../pages/Ventas'
import Gastos from '../pages/Gastos'
import Configuracion from '../pages/Configuracion'
import Layout from '../components/layout/Layout'
import Spinner from '../components/common/Spinner'

function ProtectedLayout() {
  const { usuario, cargando } = useAuth()
  if (cargando) return <Spinner fullScreen />
  if (!usuario) return <Navigate to="/login" replace />
  return <Layout><Outlet /></Layout>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificar" element={<Verificacion />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalle />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
