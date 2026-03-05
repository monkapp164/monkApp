import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e1e2e',
          color: '#cdd6f4',
          border: '1px solid #313244',
          borderRadius: '12px',
          fontSize: '14px',
        },
      }}
    />
  </React.StrictMode>
)
