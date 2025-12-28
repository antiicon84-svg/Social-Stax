import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '../src/config/firebase';

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
      
      if (data.success) {
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', email);
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
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
      
      if (data.success) {
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('user_email', email);
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
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
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('auth_token');
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
    return {
      userId: localStorage.getItem('user_id'),
      email: localStorage.getItem('user_email'),
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user_id');
  },

  /**
   * Verify token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return false;
      }
      
      const result = await callCloudFunction('verifyToken', { token });
      const data = result as any;
      return data.valid === true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },
};

export default customAuthService;
