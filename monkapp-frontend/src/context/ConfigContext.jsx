import { createContext, useContext, useState, useEffect } from 'react'
import { configuracionService } from '../services'
import toast from 'react-hot-toast'

const ConfigContext = createContext(null)

// Helper para convertir hex a RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 108, g: 99, b: 255 } // fallback a azul default
}

// Helper para convertir RGB a Hex
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('').toUpperCase()

// Calcular color más oscuro
const darkenColor = (hex, percent = 15) => {
  const rgb = hexToRgb(hex)
  const factor = 1 - percent / 100
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  )
}

// Calcular color más claro (para light variant)
const lightenColor = (hex, percent = 90) => {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * (percent / 100)),
    Math.round(rgb.g + (255 - rgb.g) * (percent / 100)),
    Math.round(rgb.b + (255 - rgb.b) * (percent / 100))
  )
}

const applyThemeColors = (config) => {
  const root = document.documentElement
  
  if (config.colorPrimario) {
    const primary = config.colorPrimario
    root.style.setProperty('--primary', primary)
    root.style.setProperty('--primary-dark', darkenColor(primary, 15))
    root.style.setProperty('--primary-light', lightenColor(primary, 90))
  }
  
  if (config.colorSecundario) {
    const secondary = config.colorSecundario
    root.style.setProperty('--secondary', secondary)
    root.style.setProperty('--secondary-dark', darkenColor(secondary, 15))
    root.style.setProperty('--secondary-light', lightenColor(secondary, 90))
  }
  
  // Aplicar dark mode si está activado
  if (config.modoOscuro) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    configuracionService.obtener()
      .then(r => {
        setConfig(r.data)
        applyThemeColors(r.data)
      })
      .catch(() => {
        toast.error('Error cargando configuración')
        setLoadingConfig(false)
      })
      .finally(() => setLoadingConfig(false))
  }, [])

  const updateConfig = async (newCfg) => {
    try {
      const { data } = await configuracionService.actualizar(newCfg)
      setConfig(data)
      applyThemeColors(data)
      return data
    } catch (error) {
      throw error
    }
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, loadingConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => useContext(ConfigContext)
