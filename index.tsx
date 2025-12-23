import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import App from './App'; // This will be the new platform-aware App component
import './types'; // Import types to ensure global declarations are picked up
import { isAppKit } from './utils/appkitUtils'; // Import isAppKit utility

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Check if we are in a sandboxed environment (blob URL)
const isBlobEnv = window.location.protocol === 'blob:';

// Function to render the app, possibly wrapped in HashRouter or MemoryRouter
const renderApp = () => {
  // If we are in a blob environment, we MUST use MemoryRouter because modifying
  // location.hash (which HashRouter does) is blocked by security policies.
  // If not in blob and not AppKit, we use HashRouter for standard web behavior.
  const Router = isBlobEnv ? MemoryRouter : HashRouter;

  const appComponent = (
    <React.StrictMode>
      {isAppKit() && !isBlobEnv ? (
        <App /> // In AppKit (non-blob), AppKitRouter handles routing internally
      ) : (
        <Router> 
          <App />
        </Router>
      )}
    </React.StrictMode>
  );
  root.render(appComponent);
};

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// AppKit's ready event ensures the platform environment is set up
// before rendering the React application.
if (window.appkit && !isBlobEnv) {
  window.appkit.ready.then(() => {
    renderApp();
  }).catch((error) => {
    console.error("AppKit failed to initialize, falling back to web rendering:", error);
    // If AppKit fails to initialize, treat it as a web environment
    renderApp();
  });
} else {
  // Fallback for direct browser access without AppKit environment
  renderApp();
}