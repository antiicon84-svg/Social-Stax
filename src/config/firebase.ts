import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

/**
 * ===================================================
 * Firebase Initialization with Enhanced Error Handling
 * ===================================================
 * This module initializes Firebase and handles configuration errors gracefully.
 * If Firebase credentials are missing or invalid, it will log helpful error messages.
 */

// Validate Firebase configuration before initialization
const validateConfig = () => {
  const requiredFields = ['apiKey', 'projectId', 'authDomain', 'appId'];
  const missingFields = requiredFields.filter(field => !FIREBASE_CONFIG[field as keyof typeof FIREBASE_CONFIG]);
  
  if (missingFields.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  FIREBASE INITIALIZATION ERROR                                  ║
╠════════════════════════════════════════════════════════════════╣
║  Missing or invalid configuration for:                          ║
║  ${missingFields.map(f => `- ${f}`).join('\n║  ')}
║                                                                 ║
║  To fix this:                                                   ║
║  1. For local development: Create .env.local with credentials  ║
║  2. For GitHub Actions: Set all secrets in Settings > Secrets  ║
║                                                                 ║
║  All required environment variables:                            ║
║  - VITE_FIREBASE_API_KEY                                        ║
║  - VITE_FIREBASE_PROJECT_ID                                     ║
║  - VITE_FIREBASE_AUTH_DOMAIN                                    ║
║  - VITE_FIREBASE_APP_ID                                         ║
║  - VITE_FIREBASE_STORAGE_BUCKET                                 ║
║  - VITE_FIREBASE_MESSAGING_SENDER_ID                            ║
╚════════════════════════════════════════════════════════════════╝
    `;
    console.error(errorMessage);
    
    // Return false to indicate initialization failure
    return false;
  }
  return true;
};

// Initialize Firebase only if configuration is valid
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  if (validateConfig()) {
    app = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase initialization skipped due to missing configuration');
  }
} catch (error: any) {
  console.error('Failed to initialize Firebase:', error);
  if (error.code === 'auth/api-key-not-valid') {
    console.error(
      'The Firebase API key appears to be invalid. Check that:',
      '1. The API key is not empty or a placeholder',
      '2. The API key is correctly formatted',
      '3. The API key has the necessary permissions in Google Cloud Console',
      '4. There are no extra spaces or special characters'
    );
  }
}

// Export instances with null safety
export const getFirebaseApp = () => {
  if (!app) {
    throw new Error('Firebase has not been initialized. Check your environment variables.');
  }
  return app;
};

export const getFirebaseAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth has not been initialized. Check your environment variables.');
  }
  return auth;
};

export const getFirebaseDB = () => {
  if (!db) {
    throw new Error('Firebase Firestore has not been initialized. Check your environment variables.');
  }
  return db;
};

// Default exports for backward compatibility
export const firebaseApp = app;
export const auth_instance = auth;
export const db_instance = db;

