import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signUpWithEmail,
  loginUser,
  logoutUser,
  loginGuest as loginGuestService
} from '~/services/authService';
import {
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseAuth } from '@/config/firebase';
import { getUserProfile } from '~/services/dbService';
import { UserProfile } from '~/types';

interface CurrentUser {
  userId: string | null;
  email: string | null;
  emailVerified: boolean;
  profile: UserProfile | null;
}

interface AuthContextType {
  currentUser: CurrentUser;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    userId: null,
    email: null,
    emailVerified: false,
    profile: null
  });

  // Check auth state on mount using Firebase Native Auth
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let profileUnsubscribe: (() => void) | null = null;

    try {
      const auth = getFirebaseAuth();

      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        // Clean up previous profile listener if exists
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }

        if (user) {
          // Set up real-time listener for user profile
          try {
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);

            profileUnsubscribe = onSnapshot(userRef, (docSnapshot) => {
              const profile = docSnapshot.exists() ? (docSnapshot.data() as UserProfile) : null;

              setCurrentUser({
                userId: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                profile
              });
              setLoading(false);
            }, (error) => {
              console.error("Profile sync error:", error);
              // Fallback to basic user info if sync fails
              setCurrentUser({
                userId: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                profile: null
              });
              setLoading(false);
            });
          } catch (err) {
            console.error(err);
            setCurrentUser({
              userId: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              profile: null
            });
            setLoading(false);
          }
        } else {
          setCurrentUser({
            userId: null,
            email: null,
            emailVerified: false,
            profile: null
          });
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Auth initialization failed (likely missing config):", error);
      setLoading(false);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      await signUpWithEmail(email, password, displayName);
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

  const loginGuest = async () => {
    try {
      await loginGuestService();
    } catch (error: any) {
      console.error('Guest Login Error:', error);
      throw new Error(error.message || 'Failed to login as guest');
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
    loginGuest,
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
