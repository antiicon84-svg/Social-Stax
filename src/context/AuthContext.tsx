import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  logoutUser 
} from '~/services/authService';
import customAuthService from '~/services/customAuthService';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirebaseAuth } from '@/config/firebase';

interface CurrentUser {
  userId: string | null;
  email: string | null;
}

interface AuthContextType {
  currentUser: CurrentUser;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    userId: null,
    email: null
  });

  // Check auth state on mount using Firebase Native Auth
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          userId: user.uid,
          email: user.email
        });
      } else {
        setCurrentUser({
          userId: null,
          email: null
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // 1. Call Custom Auth (Cloud Function) to bypass IP restriction & create user in our DB
      const result = await customAuthService.signUp(email, password);
      
      if (!result.success || !result.token) {
        throw new Error(result.message || 'Sign up failed');
      }

      // 2. Sign in with the returned Custom Token to establish native Firebase session
      const auth = getFirebaseAuth();
      await signInWithCustomToken(auth, result.token);
      
    } catch (error: any) {
      console.error('Hybrid Sign Up Error:', error);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // 1. Call Custom Auth (Cloud Function) to bypass IP restriction & verify credentials
      const result = await customAuthService.login(email, password);

      if (!result.success || !result.token) {
        throw new Error(result.message || 'Login failed');
      }

      // 2. Sign in with the returned Custom Token to establish native Firebase session
      const auth = getFirebaseAuth();
      await signInWithCustomToken(auth, result.token);

    } catch (error: any) {
      console.error('Hybrid Login Error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      // State update is handled by onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser.userId,
    signUp,
    login,
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
