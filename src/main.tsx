import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import '~/index.css'; // Essential for styling and preventing layout shifts
declare global {
  interface Window {
    appkit?: AppKit | undefined;
    gapi?: unknown;
    google?: unknown;
  }
}

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

// Unregister any stale service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

// Environment Initialization with safety checks
const initAndRender = () => {
  const ak = window.appkit;
  
  if (ak && ak.ready && typeof ak.ready.then === 'function' && !isBlobEnv) {
    console.log("AppKit detected, waiting for initialization...");
    ak.ready.then(() => {
      renderApp();
    }).catch((error: Error) => {
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
