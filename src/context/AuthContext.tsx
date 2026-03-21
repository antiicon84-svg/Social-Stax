import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signUpWithEmail,
  loginUser,
  logoutUser,
  loginGuest as loginGuestService,
  loginWithGoogle as loginWithGoogleService,
  handleGoogleRedirectResult
} from '~/services/authService';
import { 
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirebaseAuth } from '@/config/firebase';
import { getUserProfile } from '~/services/dbService';
import { UserProfile } from '~/types';

interface CurrentUser {
  userId: string | null;
  email: string | null;
  profile: UserProfile | null;
}

interface AuthContextType {
  currentUser: CurrentUser;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName?: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    userId: null,
    email: null,
    profile: null
  });

  // Check auth state on mount using Firebase Native Auth
  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (e) {
      console.error('Firebase Auth not initialized:', e);
      setLoading(false);
      return;
    }
    // Handle Google redirect result on app load
    handleGoogleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set user immediately so isAuthenticated is true right away
        // This prevents the login-loop race condition
        setCurrentUser({
          userId: user.uid,
          email: user.email,
          profile: null
        });
        setLoading(false);

        // Then fetch profile in the background and update
        try {
          const profile = await getUserProfile().catch(e => {
            console.warn("Failed to fetch profile", e);
            return null;
          });
          setCurrentUser(prev => prev.userId === user.uid ? { ...prev, profile } : prev);
        } catch (err) {
          console.error(err);
        }
      } else {
        setCurrentUser({
          userId: null,
          email: null,
          profile: null
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, phone?: string) => {
    try {
      await signUpWithEmail(email, password, displayName, phone);
      // onAuthStateChanged will handle the state update
    } catch (error: Error) {
      console.error('Sign Up Error:', error);
      // Re-throw original error so caller can inspect error code
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      // onAuthStateChanged will handle the state update
    } catch (error: Error) {
      console.error('Login Error:', error);
      throw error; // Re-throw original so caller can inspect error.code
    }
  };

  const loginWithGoogle = async () => {
    try {
      await loginWithGoogleService();
    } catch (error: Error) {
      console.error('Google Login Error:', error);
      throw new Error(error.message || 'Failed to login with Google');
    }
  };

  const loginGuest = async () => {
    try {
      await loginGuestService();
    } catch (error: Error) {
      console.error('Guest Login Error:', error);
      throw new Error(error.message || 'Failed to login as guest');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error: Error) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser.userId,
    isAdmin: currentUser.profile?.role === 'admin',
    signUp,
    login,
    loginGuest,
    loginWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
