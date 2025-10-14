import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA Service Worker for offline support and better printer connectivity
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🚀 PWA Service Worker registered successfully:', registration.scope);
        
        // Enhanced printer connectivity in PWA mode
        if (registration.active) {
          console.log('✅ PWA is now ready for enhanced iPad printing!');
        }
      })
      .catch((error) => {
        console.log('❌ PWA Service Worker registration failed:', error);
      });
  });

  // Listen for service worker updates
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRINTER_STATUS_UPDATE') {
      console.log('🖨️ PWA Printer status updated:', event.data.status);
      // This could trigger UI updates for printer connection status
    }
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
