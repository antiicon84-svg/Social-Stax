import { DropdownOption } from './types';

export const APP_ID = 'socialstack-ai-manager';
export const OFFICIAL_WEBSITE_URL = import.meta.env.VITE_FIREBASE_URL || 'https://YOUR-PROJECT-ID.web.app';

// Google Gemini API Key
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Firebase Configuration - using environment variables with validation
const validateFirebaseConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!projectId || projectId === '' || projectId.includes('YOUR-')) {
    console.error('Firebase config error: Missing or invalid environment variables');
  }

  return {
    apiKey: apiKey || '',
    authDomain: authDomain || '',
    projectId: projectId || '',
    storageBucket: storageBucket || '',
    messagingSenderId: messagingSenderId || '',
    appId: appId || '',
  };
};

export const FIREBASE_CONFIG = validateFirebaseConfig();

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

export const BRAND_TONE_OPTIONS: DropdownOption[] = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Bold', label: 'Bold' },
  { value: 'Playful', label: 'Playful' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Minimalist', label: 'Minimalist' },
];

   export const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn'];
