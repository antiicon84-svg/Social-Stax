import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { getFirebaseFunctions, getFirebaseAuth } from '@/config/firebase';

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

const callCloudFunction = async (functionName: string, data: Record<string, unknown>) => {
  try {
    const functions = getFirebaseFunctions();
    const fn = httpsCallable(functions, functionName);
    const result = await fn(data);
    return result.data;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error(`Cloud Function ${functionName} error:`, error);
    if (err.code === 'functions/unavailable') {
      throw new Error('Cloud Functions are not available. Check your Firebase configuration.');
    }
    if (err.code === 'functions/unauthenticated') {
      throw new Error('Authentication failed. Please check your credentials.');
    }
    if (err.message?.includes('auth/api-key-not-valid')) {
      throw new Error('Firebase API key is invalid. Check your environment variables.');
    }
    throw error;
  }
};

export const customAuthService = {
  async signUp(email: string, password: string): Promise<SignupResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      const result = await callCloudFunction('signUp', { email, password });
      const data = result as SignupResponse;
      if (data.success && data.token) {
        const auth = getFirebaseAuth();
        await signInWithCustomToken(auth, data.token);
      }
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Login error:', error);
      return {
        success: false,
        message: err.message || 'Login failed. Please try again.',
      };
    }
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      const result = await callCloudFunction('login', { email, password });
      const data = result as LoginResponse;
      if (data.success && data.token) {
        const auth = getFirebaseAuth();
        await signInWithCustomToken(auth, data.token);
      }
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Login error:', error);
      return {
        success: false,
        message: err.message || 'Login failed. Please try again.',
      };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  getCurrentUser(): CurrentUser {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    return {
      userId: user?.uid || null,
      email: user?.email || null,
    };
  },

  isAuthenticated(): boolean {
    const auth = getFirebaseAuth();
    return !!auth.currentUser;
  },

  async verifyToken(): Promise<boolean> {
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) return false;
      await user.getIdToken(true);
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },
};

export default customAuthService;
