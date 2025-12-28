import { DropdownOption } from '~/types';

export const APP_ID = 'socialstack-ai-manager';

// Official website URL - for Firebase Hosting
export const OFFICIAL_WEBSITE_URL = import.meta.env.VITE_FIREBASE_URL || 'https://YOUR-PROJECT-ID.web.app';

// Google Gemini API Key - for AI features
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// ===================================================
// Firebase Configuration - Using Environment Variables
// ===================================================
// Enhanced validation to detect missing/invalid credentials early
const validateFirebaseConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';

  // Check for missing or placeholder values
  const isMissing = !projectId || projectId === '' || projectId.includes('YOUR-');
  const isInvalid = {
    apiKey: !apiKey || apiKey === '',
    authDomain: !authDomain || authDomain === '',
    projectId: !projectId || projectId === '',
    storageBucket: !storageBucket || storageBucket === '',
    messagingSenderId: !messagingSenderId || messagingSenderId === '',
    appId: !appId || appId === '',
  };

  // Log detailed error information
  if (isMissing) {
    const missingVars = Object.entries(isInvalid)
      .filter(([_, v]) => v)
      .map(([k, _]) => k)
      .join(', ');
    
    console.error(
      'Firebase Configuration Error: Missing or invalid environment variables',
      `\n---\nMissing: ${missingVars}`,
      `\nPlease ensure these environment variables are set in your build environment:`,
      `\n- VITE_FIREBASE_API_KEY`,
      `\n- VITE_FIREBASE_AUTH_DOMAIN`,
      `\n- VITE_FIREBASE_PROJECT_ID`,
      `\n- VITE_FIREBASE_STORAGE_BUCKET`,
      `\n- VITE_FIREBASE_MESSAGING_SENDER_ID`,
      `\n- VITE_FIREBASE_APP_ID`,
      `\nFor local development, create a .env.local file with your actual Firebase credentials.`,
      `\nFor GitHub Actions, verify that all secrets are set in Settings > Secrets and variables > Actions`,
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
};

export const FIREBASE_CONFIG = validateFirebaseConfig();

// ===================================================
// Industry Options
// ===================================================
export const INDUSTRY_OPTIONS: DropdownOption[] = [
  { value: 'Tech', label: 'Tech' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Food', label: 'Food' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Education', label: 'Education' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Real Estate', label: 'Real Estate' },
];

// ===================================================
// Brand Tone Options
// ===================================================
export const BRAND_TONE_OPTIONS: DropdownOption[] = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Bold', label: 'Bold' },
  { value: 'Playful', label: 'Playful' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Minimalist', label: 'Minimalist' },
];

// ===================================================
// Social Media Platforms
// ===================================================
export const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn'];
