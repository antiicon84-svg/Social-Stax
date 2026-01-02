import React, { useState, useEffect } from 'react';
import WebRouter from './routes/WebRouter'; // Import the renamed main application component for web
import AppKitRouter from './routes/AppKitRouter'; // Import the new AppKit-specific router
import LoadingSpinner from './components/LoadingSpinner';
import { isAppKit } from '~/utils/appkitUtils'; // Import appkit utilities
import { AuthProvider } from './context/AuthContext'; // Import authentication context provider

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAppKitEnvironment, setIsAppKitEnvironment] = useState(false);
  console.log('[App] Render: isReady', isReady, 'isAppKitEnvironment', isAppKitEnvironment);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('[App] Initializing...');
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
    console.log('[App] Not ready, showing spinner');
    return (
      <AuthProvider>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <LoadingSpinner size="lg" />
        </div>
      </AuthProvider>
    );
  }

  console.log('[App] Ready, rendering', isAppKitEnvironment ? 'AppKitRouter' : 'WebRouter');
  return (
    <AuthProvider>
      {isAppKitEnvironment ? <AppKitRouter /> : <WebRouter />}
    </AuthProvider>
  )
};

export default App;
