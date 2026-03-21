/**
 * Utility to check if the app is running in an AppKit environment
 */

declare global {
  interface Window {
    appkit?: {
      on: (event: string, callback: () => void) => void;
    };
  }
}

export const isAppKit = (): boolean => {
  // Check for the presence of the appkit object injected by the native wrapper
  return typeof window.appkit !== 'undefined';
};

/**
 * Common AppKit actions and event listeners can be added here
 */
export const initializeAppKitListeners = () => {
  if (!isAppKit() || !window.appkit) return;

  // Example: Listen for back button events from native side
  window.appkit.on('backbutton', () => {
    console.log('Native back button pressed');
  });
};
