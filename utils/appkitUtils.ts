/**
 * Utility to check if the app is running in an AppKit environment
 */
export const isAppKit = (): boolean => {
  // Check for the presence of the appkit object injected by the native wrapper
  return typeof (window as any).appkit !== 'undefined';
};

/**
 * Common AppKit actions and event listeners can be added here
 */
export const initializeAppKitListeners = () => {
  if (!isAppKit()) return;

  // Example: Listen for back button events from native side
  (window as any).appkit.on('backbutton', () => {
    console.log('Native back button pressed');
  });
};
