import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './types';
import { isAppKit } from './utils/appkitUtils';

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
        {isAppKit() && !isBlobEnv ? (
          <App />
        ) : (
          <Router> 
            <App />
          </Router>
        )}
      </ErrorBoundary>
    </React.StrictMode>
  );
  root.render(appComponent);
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

if (window.appkit && !isBlobEnv) {
  window.appkit.ready.then(() => {
    renderApp();
  }).catch((error) => {
    console.error("AppKit failed to initialize, falling back to web rendering:", error);
    renderApp();
  });
} else {
  renderApp();
}
