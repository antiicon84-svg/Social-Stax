import React, { useState, useEffect } from 'react';
import WebRouter from './WebRouter'; // Import the renamed main application component for web
import AppKitRouter from './AppKitRouter'; // Import the new AppKit-specific router
import LoadingSpinner from './components/LoadingSpinner';
import './types'; // Import types to ensure global declarations are picked up
import { isAppKit } from './utils/appkitUtils'; // Import appkit utilities

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAppKitEnvironment, setIsAppKitEnvironment] = useState(false);

  useEffect(() => {
    if (isAppKit()) {
      setIsAppKitEnvironment(true);
      window.appkit!.ready.then(() => {
        setIsReady(true);
      }).catch((error) => {
        console.error("AppKit failed to initialize:", error);
        // Fallback to web if AppKit fails
        setIsAppKitEnvironment(false);
        setIsReady(true);
      });
    } else {
      // Running in a standard web browser environment
      setIsAppKitEnvironment(false);
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-xl text-gray-700">Initializing app...</p>
      </div>
    );
  }

  // Render the appropriate router based on the environment
  if (isAppKitEnvironment) {
    return <AppKitRouter />;
  } else {
    return <WebRouter />;
  }
};

export default App;.js
