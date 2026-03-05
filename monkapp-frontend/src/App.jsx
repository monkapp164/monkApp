import { AuthProvider } from './context/AuthContext'
import { ConfigProvider } from './context/ConfigContext'
import AppRouter from './router/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <AppRouter />
      </ConfigProvider>
    </AuthProvider>
  )
}
