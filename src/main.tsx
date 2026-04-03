import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext'
import { SessionProvider } from './contexts/SessionContext'
import { queryClient } from './lib/queryClient'
import { registerServiceWorker } from './registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SessionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SessionProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)