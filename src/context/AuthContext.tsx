import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import customAuthService from '../services/customAuthService';

interface CurrentUser {
  userId: string | null;
  email: string | null;
}

interface AuthContextType {
  currentUser: CurrentUser;
  loading: boolean;
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

  // Check auth state on mount
  useEffect(() => {
    const user = customAuthService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await customAuthService.signUp(email, password);
      if (result.success) {
        const user = customAuthService.getCurrentUser();
        setCurrentUser(user);
      } else {
        throw new Error(result.message || 'Sign up failed');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await customAuthService.login(email, password);
      if (result.success) {
        const user = customAuthService.getCurrentUser();
        setCurrentUser(user);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await customAuthService.logout();
      setCurrentUser({
        userId: null,
        email: null
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
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
