import { createContext, useContext, useState, useEffect } from 'react'
import { configuracionService } from '../services'
import toast from 'react-hot-toast'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    configuracionService.obtener()
      .then(r => setConfig(r.data))
      .catch(() => toast.error('Error cargando configuración'))
      .finally(() => setLoadingConfig(false))
  }, [])

  // Whenever config changes we make sure the theme and colors are applied
  useEffect(() => {
    if (config) applyTheme(config.modoOscuro)
    if (config) {
      if (config.colorPrimario) {
        document.documentElement.style.setProperty('--primary', config.colorPrimario)
      }
      if (config.colorSecundario) {
        document.documentElement.style.setProperty('--secondary', config.colorSecundario)
      }
    }
  }, [config])

  const applyTheme = (dark) => {
    document.body.classList.toggle('dark', !!dark)
  }

  const updateConfig = async (newCfg) => {
    const { data } = await configuracionService.actualizar(newCfg)
    setConfig(data)
    return data
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, loadingConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)
