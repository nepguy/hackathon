import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { clearAuthSession } from './lib/supabase.ts'

// Make clearAuthSession available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthSession = clearAuthSession;
  console.log('🔧 Added clearAuthSession() to window for debugging');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)