import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { getFirebaseFunctions, auth_instance as auth } from '../src/config/firebase';

/**
 * ===================================================
 * Custom Authentication Service for Social Stax
 * ===================================================
 * Provides secure email/password authentication with JWT tokens.
 * Uses Firebase Cloud Functions for backend authentication.
 * Includes comprehensive error handling for Firebase initialization failures.
 */

// Response interfaces
export interface SignupResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  email?: string;
}

export interface CurrentUser {
  userId: string | null;
  email: string | null;
}

/**
 * Helper function to safely call Cloud Functions
 */
const callCloudFunction = async (functionName: string, data: any) => {
  try {
    const functions = getFirebaseFunctions();
    const fn = httpsCallable(functions, functionName);
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error(`Cloud Function ${functionName} error:`, error);
    
    // Handle specific Firebase errors
    if (error.code === 'functions/unavailable') {
      throw new Error('Cloud Functions are not available. Check your Firebase configuration.');
    }
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Authentication failed. Please check your credentials.');
    }
    if (error.message?.includes('auth/api-key-not-valid')) {
      throw new Error('Firebase API key is invalid. Check your environment variables.');
    }
    
    throw error;
  }
};

/**
 * Custom Authentication Service
 */
export const customAuthService = {
  /**
   * Sign up a new user with email and password
   * @param email User email address
   * @param password User password (hashed on backend)
   */
  async signUp(email: string, password: string): Promise<SignupResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const result = await callCloudFunction('signUp', { email, password });
      const data = result as any;
      
      if (data.success && data.token) {
        // Sign in to Firebase Client SDK with the custom token
        await signInWithCustomToken(auth, data.token);
      }
      return data;
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message || 'Sign up failed. Please try again.',
      };
    }
  },

  /**
   * Login user with email and password
   * @param email User email address
   * @param password User password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const result = await callCloudFunction('login', { email, password });
      const data = result as any;
      
      if (data.success && data.token) {
        // Sign in to Firebase Client SDK with the custom token
        await signInWithCustomToken(auth, data.token);
      }
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  /**
   * Get the currently logged-in user
   */
  getCurrentUser(): CurrentUser {
    const user = auth.currentUser;
    return {
      userId: user?.uid || null,
      email: user?.email || null,
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  },

  /**
   * Verify token is still valid
   * Note: With Firebase Auth integration, checking currentUser is usually sufficient,
   * but we can keep this for specific backend token checks if needed.
   */
  async verifyToken(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      
      // Force refresh token to ensure validity
      await user.getIdToken(true);
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },
};

export default customAuthService;
