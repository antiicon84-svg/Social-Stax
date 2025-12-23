import React, { useState, useEffect } from 'react';
import WebRouter from './WebRouter'; // Import the renamed main application component for web
import AppKitRouter from './AppKitRouter'; // Import the new AppKit-specific router
import LoadingSpinner from './components/LoadingSpinner';
import { isAppKit } from './utils/appkitUtils'; // Import appkit utilities

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAppKitEnvironment, setIsAppKitEnvironment] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if running in AppKit environment
        if (isAppKit() && (window as any).appkit) {
          setIsAppKitEnvironment(true);
          try {
            await (window as any).appkit.ready;
            setIsReady(true);
          } catch (error) {
            console.error("AppKit failed to initialize:", error);
            // Fallback to web if AppKit fails
            setIsAppKitEnvironment(false);
            setIsReady(true);
          }
        } else {
          // Running in a standard web browser environment
          setIsAppKitEnvironment(false);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return isAppKitEnvironment ? <AppKitRouter /> : <WebRouter />;
};

export default App;
