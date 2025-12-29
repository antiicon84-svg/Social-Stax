import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  customAuthService 
} from '~/services/customAuthService';
import { 
  onAuthStateChanged 
} from 'firebase/auth';
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
      const response = await customAuthService.signUp(email, password);
      if (!response.success) {
        throw new Error(response.message);
      }
      // Note: customAuthService handles signInWithCustomToken, 
      // so onAuthStateChanged will update the state automatically.
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await customAuthService.login(email, password);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await customAuthService.logout();
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
