# 🎨 Sistema de Temas Profesional

## Cómo funciona

El sistema de temas dinámico permite cambiar los colores corporativos de toda la aplicación desde **Configuración > Personalización**.

### Variables CSS Disponibles

```css
/* Colores base */
--primary          → Color primario (botones, enlaces, destacados)
--primary-dark     → Variante oscura (hover en botones)
--primary-light    → Variante clara (badges, fondos suaves)
--secondary        → Color secundario
--secondary-dark   → Variante oscura del secundario
--secondary-light  → Variante clara del secundario

/* Estados semánticos */
--success   → Verde (#22C55E)
--warning   → Naranja (#F59E0B)
--danger    → Rojo (#EF4444)
--info      → Azul (#3B82F6)

/* Superficies */
--bg        → Fondo de página
--card      → Tarjetas y contenedores
--overlay   → Fondos semitrasparentes (modales)

/* Bordes y divisores */
--border        → Borde principal
--border-light  → Borde sutil

/* Texto */
--text              → Texto principal
--text-secondary    → Texto secundario (gris)
--text-tertiary     → Texto terciario (gris claro)

/* Efectos */
--shadow-sm   → Sombra pequeña
--shadow      → Sombra estándar
--shadow-lg   → Sombra grande
--transition  → Transición suave

/* Espacios */
--radius      → Radio grande (14px)
--radius-sm   → Radio pequeño (8px)
--radius-lg   → Radio muy grande (20px)
```

## Flujo de cambio de colores

1. **Usuario abre Configuración > Personalización**
2. **Selecciona nuevo color primario**
3. **ConfigContext.jsx calcula automáticamente:**
   - `--primary-dark` (15% más oscuro)
   - `--primary-light` (90% más claro)
4. **Aplica directamente al DOM:**
   ```javascript
   document.documentElement.style.setProperty('--primary', '#nuevo-color')
   ```
5. **Todos los componentes se actualizan automáticamente** porque usan `var(--primary)`
6. **Cambios se guardan en la API**
7. **Al recargar, se cargan los colores guardados**

## Modo Oscuro

El dark mode sobrescribe automáticamente algunos colores:

```css
body.dark {
  --bg: #1a1a2e;
  --card: #2a2a3a;
  --border: #3a3a3a;
  --text: #e5e5e5;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}
```

## Ejemplos de uso en componentes

### Botón primario
```jsx
<button style={{ background: 'var(--primary)', color: 'white' }}>
  Click
</button>
```

### Tarjeta
```jsx
<div style={{
  background: 'var(--card)',
  border: `1px solid var(--border)`,
  boxShadow: 'var(--shadow)',
  borderRadius: 'var(--radius)'
}}>
  Contenido
</div>
```

### Texto secundario
```jsx
<p style={{ color: 'var(--text-secondary)' }}>
  Descripción
</p>
```

### Clases CSS disponibles

También puedes usar clases predefinidas:

```jsx
<button className="btn-primary">Botón primario</button>
<button className="btn-secondary">Botón secundario</button>
<button className="btn-outline">Botón outline</button>
<button className="btn-success">Éxito</button>
<button className="btn-danger">Peligro</button>

<div className="card">Tarjeta</div>

<span className="badge badge-primary">Badge primario</span>
<span className="badge badge-success">Badge éxito</span>

<div className="alert alert-success">Alerta éxito</div>
<div className="alert alert-danger">Alerta peligro</div>

<span className="text-primary">Texto primario</span>
<span className="text-muted">Texto mutado</span>
<div className="bg-light">Fondo claro</div>
```

## Checklist para agregar nuevos componentes

Cuando crees nuevos componentes, asegúrate de:

- ✅ Usar `var(--primary)` para colores principales
- ✅ Usar `var(--card)` para fondos de contenedores
- ✅ Usar `var(--text)` para texto principal
- ✅ Usar `var(--text-secondary)` para texto gris
- ✅ Usar `var(--border)` para bordes
- ✅ Usar `var(--shadow)` para sombras
- ✅ Usar `var(--radius)` para border-radius
- ✅ Usar `var(--transition)` para transiciones suaves
- ✅ NO usar colores hardcodeados como `#6C63FF`

## Ejemplo completo de componente bien hecho

```jsx
export default function MiComponente() {
  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid var(--border)`,
      borderRadius: 'var(--radius)',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      transition: 'var(--transition)'
    }}>
      <h2 style={{ color: 'var(--text)', marginBottom: 12 }}>
        Título
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Descripción
      </p>
      
      <button style={{
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 16px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'var(--transition)'
      }}>
        Acción
      </button>
    </div>
  )
}
```

## Función de ayuda para calcular color contraste (para desarrolladores)

Si necesitas generar variantes de colores en JavaScript:

```javascript
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
}

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('').toUpperCase()

const darkenColor = (hex, percent = 15) => {
  const rgb = hexToRgb(hex)
  const factor = 1 - percent / 100
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  )
}

const lightenColor = (hex, percent = 90) => {
  const rgb = hexToRgb(hex)
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * (percent / 100)),
    Math.round(rgb.g + (255 - rgb.g) * (percent / 100)),
    Math.round(rgb.b + (255 - rgb.b) * (percent / 100))
  )
}
```

---

**Nota:** El sistema respeta el dark mode automáticamente. No necesitas hacer nada especial para ello.
