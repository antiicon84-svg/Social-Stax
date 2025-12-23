import { DropdownOption } from './types';

// API Key is now handled via process.env.API_KEY as per security guidelines.

export const APP_ID = 'socialstack-ai-manager'; // Unique identifier for your app data path

// REPLACE THIS with your actual Firebase Hosting URL after you create the project
// Example: 'https://socialstack-manager-123.web.app'
export const OFFICIAL_WEBSITE_URL = process.env.VITE_FIREBASE_URL || 'https://YOUR-PROJECT-ID.web.app';

// Configuration for Firebase services
// TODO: Replace with your actual Firebase credentials from https://console.firebase.google.com
// These should ideally come from environment variables in production
export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDummy-placeholder-for-testing",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "social-stax-demo.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "social-stax-demo",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "social-stax-demo.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef1234567890"
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
  { value: 'Witty', label: 'Witty' },
  { value: 'Bold', label: 'Bold' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Luxurious', label: 'Luxurious' },
  { value: 'Empathetic', label: 'Empathetic' },
  { value: 'Energetic', label: 'Energetic' },
  { value: 'Sophisticated', label: 'Sophisticated' },
];

export const SOCIAL_PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter', 'Facebook'];

// Text prompt for Gemini API
export const GEMINI_PROMPT_TEMPLATE = `You are a social media manager for {Client Name} in the {Industry} industry. Their brand voice is strictly: {Tone}. Create a compelling {Platform} post about: {Topic}`;

// Image prompt for Imagen API
export const IMAGEN_PROMPT_TEMPLATE = `Professional high quality photography for a brand called {Client Name} ({Industry} industry). Concept: {Topic}. Style: {Tone}. High resolution, 4k, photorealistic.`;