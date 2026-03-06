import { useEffect, useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import toast from 'react-hot-toast'
import Spinner from '../components/common/Spinner'

function Toggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={onChange} style={{
        width: 46, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
        background: value ? 'var(--primary)' : 'var(--border)', position: 'relative',
        transition: 'background 0.2s'
      }}>
        <div style={{
          position: 'absolute', top: 3, width: 20, height: 20,
          background: 'var(--card)', borderRadius: '50%',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          left: value ? 23 : 3, transition: 'left 0.2s'
        }} />
      </div>
    </div>
  )
}

const SECCIONES = [
  {
    emoji: '🎨', titulo: 'Apariencia',
    items: [
      { key: 'modoOscuro', label: 'Modo oscuro', desc: 'Cambia el tema visual' },
    ]
  },
  {
    emoji: '🔔', titulo: 'Notificaciones',
    items: [
      { key: 'notifCobro', label: 'Recordatorios de cobro' },
      { key: 'notifStockBajo', label: 'Alertas de stock bajo' },
      { key: 'notifProveedores', label: 'Recordatorios de proveedores' },
    ]
  },
  {
    emoji: '📶', titulo: 'Sincronización',
    items: [
      { key: 'modoOffline', label: 'Modo offline', desc: 'Trabajar sin conexión a internet' },
      { key: 'backupAutomatico', label: 'Backup automático en la nube' },
    ]
  },
  {
    emoji: '🔒', titulo: 'Seguridad',
    items: [
      { key: 'twoFactor', label: 'Autenticación de dos factores' },
      { key: 'historialAuditoria', label: 'Historial de auditoría' },
    ]
  },
]

export default function Configuracion() {
  const { config, updateConfig } = useConfig()
  const [cfg, setCfg] = useState(null)
  const [saving, setSaving] = useState(false)

  // when global config is fetched populate local copy
  useEffect(() => {
    if (config) setCfg(config)
  }, [config])

  const toggle = (key) => setCfg(prev => {
    const updated = { ...prev, [key]: !prev[key] }
    if (key === 'modoOscuro') document.body.classList.toggle('dark', updated.modoOscuro)
    return updated
  })

  const guardar = async () => {
    setSaving(true)
    try {
      const updated = await updateConfig(cfg)
      toast.success('Configuración guardada ✅')
      setCfg(updated) // make sure local copy is in sync
    } catch {
      toast.error('Error al guardar')
    } finally { setSaving(false) }
  }

  if (!cfg) return <Spinner />

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 22 }}>Configuración ⚙️</h1>

      {SECCIONES.map(sec => (
        <div key={sec.titulo} style={{ background: 'var(--card)', borderRadius: 16,
              padding: '20px 24px', marginBottom: 14,
              boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
                       textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            {sec.emoji} {sec.titulo}
          </h3>
          {sec.items.map(it => (
            <Toggle key={it.key} label={it.label} desc={it.desc}
              value={!!cfg[it.key]} onChange={() => toggle(it.key)} />
          ))}
        </div>
      ))}

      {/* Personalización */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: '24px',
                    marginBottom: 24, boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
                     textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
          🎨 Personalización
        </h3>
        
        {/* Colores corporativos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            Colores corporativos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[['colorPrimario', 'Color primario', 'Utilizado en botones, enlaces y elementos destacados']].map(([key, label, desc]) => (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <input type="color" value={cfg[key] || '#6C63FF'}
                    onChange={e => {
                      const val = e.target.value
                      setCfg({ ...cfg, [key]: val })
                      if (key === 'colorPrimario') {
                        document.documentElement.style.setProperty('--primary', val)
                        // Calcular colores derivados
                        const darkerColor = val // Simplified - el servidor lo calcula mejor
                        document.documentElement.style.setProperty('--primary-dark', darkerColor)
                      }
                    }}
                    style={{ width: 64, height: 56, border: '2px solid var(--border)', borderRadius: 12,
                             cursor: 'pointer', padding: 2, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {desc}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, fontFamily: 'monospace' }}>
                      {cfg[key] || '#6C63FF'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview de colores */}
        <div style={{ marginBottom: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
            Vista previa
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            <div style={{ background: cfg.colorPrimario || '#6C63FF', borderRadius: 12, padding: 16, color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Color primario</div>
              <button style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Botón</button>
            </div>
            <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: 16, color: 'var(--primary)', textAlign: 'center', border: `1px solid var(--border)` }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Variante clara</div>
              <div style={{ fontSize: 11, padding: '4px 8px', background: 'var(--primary)', color: 'white', borderRadius: 4, display: 'inline-block' }}>Badge</div>
            </div>
          </div>
        </div>

        {/* Umbral de stock */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            Umbral de stock bajo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="number" min={1} max={100}
              value={cfg.umbralStock || 5}
              onChange={e => setCfg({ ...cfg, umbralStock: parseInt(e.target.value) })}
              style={{ width: 100, padding: '10px 12px', border: '1.5px solid var(--border)',
                       borderRadius: 8, fontSize: 14, outline: 'none', color: 'var(--text)', background: 'var(--card)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>unidades</span>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Mostrar alerta cuando el stock sea menor que este valor
            </div>
          </div>
        </div>
      </div>

      <button onClick={guardar} disabled={saving} style={{
        width: '100%', padding: '14px',
        background: saving ? 'var(--primary-dark)' : 'var(--primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 15, fontWeight: 700,
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'var(--transition)',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? '⏳ Guardando...' : '✅ Guardar configuración'}
      </button>
    </div>
  )
}
