import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signUpWithEmail,
  loginUser,
  logoutUser
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
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
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
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user profile
        let profile: UserProfile | null = null;
        try {
          // We need to wait a bit if it's a new signup for the profile to be created
          // But usually getUserProfile handles null gracefully or we can retry
          // For now, simple fetch
          // Note: getUserProfile uses getAuthenticatedUid which relies on getCurrentUser from authService
          // But here we are inside onAuthStateChanged, so authService might not be updated yet?
          // Actually dbService.getUserProfile calls getAuthenticatedUid() -> getCurrentUser()
          // We should probably pass the uid directly if dbService allowed, but it doesn't.
          // However, firebase auth state is global.
          profile = await getUserProfile().catch(e => {
            console.warn("Failed to fetch profile", e);
            return null;
          });
        } catch (err) {
            console.error(err);
        }

        setCurrentUser({
          userId: user.uid,
          email: user.email,
          profile
        });
      } else {
        setCurrentUser({
          userId: null,
          email: null,
          profile: null
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
      // onAuthStateChanged will handle the state update
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      // onAuthStateChanged will handle the state update
    } catch (error: any) {
      console.error('Login Error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error: any) {
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
