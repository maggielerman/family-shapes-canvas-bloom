import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/serviceWorker'
import { initPerformanceMonitoring } from './utils/performance'

// Comprehensive error logging
console.log('🚀 Application starting...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🔥 Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', {
    reason: event.reason,
    stack: event.reason?.stack
  });
});

// React error boundary logging
const originalConsoleError = console.error;
console.error = (...args) => {
  console.log('🔥 React error logged:', args);
  originalConsoleError.apply(console, args);
};

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  console.log('📱 Registering service worker...');
  registerServiceWorker();
}

// Initialize performance monitoring
console.log('📊 Initializing performance monitoring...');
initPerformanceMonitoring();

console.log('🎯 Rendering App component...');
const rootElement = document.getElementById("root");
console.log('🎯 Root element found:', !!rootElement);

if (!rootElement) {
  console.error('🔥 Root element not found!');
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  console.log('🎯 Root created successfully');
  
  root.render(<App />);
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('🔥 Error during app render:', error);
  throw error;
}
