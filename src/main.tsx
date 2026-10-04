import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter non-breaking upstream THREE.Clock deprecation warning emitted by @react-three/fiber internal loop
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Catch and suppress Vite HMR WebSocket reconnection and upstream root unmount warnings
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://') ||
      msg.includes('unmount a root while React was already rendering')
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('unmount a root while React was already rendering')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
