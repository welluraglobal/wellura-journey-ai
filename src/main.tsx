
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/chat.css'

// Add global error handler to catch and log auth-related errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add debugging for URL parameters
const debugUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlHash = window.location.hash;
  
  console.log('Current URL:', window.location.href);
  console.log('URL Parameters:', Object.fromEntries(urlParams.entries()));
  
  if (urlHash) {
    console.log('URL Hash:', urlHash);
    try {
      const hashParams = new URLSearchParams(urlHash.substring(1));
      console.log('Hash Parameters:', Object.fromEntries(hashParams.entries()));
    } catch (e) {
      console.log('Could not parse hash parameters');
    }
  }
};

// Add mobile platform detection
const detectMobilePlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  
  if (/android/i.test(userAgent)) {
    document.documentElement.classList.add('android-device');
    console.log('Android device detected');
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    document.documentElement.classList.add('ios-device');
    console.log('iOS device detected');
  }
  
  // Detect touch capability
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch-device');
    console.log('Touch device detected');
  }
};

// Run debugging and detection on load
debugUrlParams();
detectMobilePlatform();

// Set viewport meta tag programmatically for better mobile handling
const setViewportMeta = () => {
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  
  viewportMeta.setAttribute('content', 
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
};

setViewportMeta();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
