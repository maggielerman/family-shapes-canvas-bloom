import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/serviceWorker'
import { initPerformanceMonitoring } from './utils/performance'

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Initialize performance monitoring
initPerformanceMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
