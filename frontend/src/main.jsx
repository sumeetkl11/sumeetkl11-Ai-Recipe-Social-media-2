import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initWebVitals } from './utils/webVitals.js'
import logger from './utils/logger.js'

// Start performance monitoring immediately
initWebVitals();
logger.info('App initialized', { version: import.meta.env.VITE_APP_VERSION ?? 'dev' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
