export default function Spinner({ fullScreen, size = 40 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...(fullScreen && { height: '100vh', width: '100vw' })
    }}>
      <div style={{
        width: size, height: size,
        border: '3px solid #E8E8F0',
        borderTop: '3px solid #6C63FF',
        borderRadius: '50%',
        animation: 'mk-spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes mk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
