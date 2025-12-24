import { DropdownOption } from './types';

export const APP_ID = 'socialstack-ai-manager';
export const OFFICIAL_WEBSITE_URL = import.meta.env.VITE_FIREBASE_URL || 'https://YOUR-PROJECT-ID.web.app';

// Google Gemini API Key
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC6Lp1RXcPOriip2w5WECr0hli9rO5-Fbd8',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'elegant-fort-482119-t4.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'elegant-fort-482119-t4',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'elegant-fort-482119-t4.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '113495474391',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:113495474391:web:abcdef1234567890'
};

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
