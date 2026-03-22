/**
 * Utility to check if the app is running in an AppKit environment
 */

declare global {
  interface Window {
    appkit?: AppKit | undefined;
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
  if ('on' in window.appkit && typeof (window.appkit as any).on === 'function') {
    (window.appkit as any).on('backbutton', () => {
      console.log('Native back button pressed');
    });
  }
};
