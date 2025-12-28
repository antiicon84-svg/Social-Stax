import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import '../index.css'; // Essential for styling and preventing layout shiftsimport { isAppKit } from './utils/appkitUtils';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const isBlobEnv = window.location.protocol === 'blob:';

const renderApp = () => {
  const Router = isBlobEnv ? MemoryRouter : HashRouter;
  
  const appComponent = (
    <React.StrictMode>
      <ErrorBoundary>
        <Router> 
          <App />
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
  root.render(appComponent);
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// Environment Initialization with safety checks
const initAndRender = () => {
  const ak = (window as any).appkit;
  
  if (ak && ak.ready && typeof ak.ready.then === 'function' && !isBlobEnv) {
    console.log("AppKit detected, waiting for initialization...");
    ak.ready.then(() => {
      renderApp();
    }).catch((error: any) => {
      console.error("AppKit failed to initialize, falling back to web rendering:", error);
      renderApp();
    });
  } else {
    console.log("Standard browser environment detected.");
    renderApp();
  }
};

// Start the app
initAndRender();
