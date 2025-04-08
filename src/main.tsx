
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

// Run debugging on load
debugUrlParams();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
