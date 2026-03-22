import React, { useState, useEffect } from 'react';
import WebRouter from './routes/WebRouter';
import AppKitRouter from './routes/AppKitRouter';
import LoadingSpinner from './components/LoadingSpinner';
import { isAppKit } from '~/utils/appkitUtils';
import { AuthProvider } from './context/AuthContext';
declare global {
  interface Window {
    appkit?: AppKit | undefined;
    gapi?: unknown;
    google?: unknown;
  }
}

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAppKitEnvironment, setIsAppKitEnvironment] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (isAppKit() && window.appkit) {
          setIsAppKitEnvironment(true);
          try {
            await window.appkit.ready;
            setIsReady(true);
          } catch (error) {
            console.error("AppKit failed to initialize:", error);
            setIsAppKitEnvironment(false);
            setIsReady(true);
          }
        } else {
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
      <AuthProvider>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <LoadingSpinner size="lg" />
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      {isAppKitEnvironment ? <AppKitRouter /> : <WebRouter />}
    </AuthProvider>
  );
};

export default App;
