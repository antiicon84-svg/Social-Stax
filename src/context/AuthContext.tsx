import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  logoutUser 
} from '~/services/authService';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/config/firebase';

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
      const auth = getFirebaseAuth();
      // 1. Create user with standard Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user document in Firestore (Client-side)
      // This works because firestore.rules allows write: if request.auth.uid == userId
      const db = getFirebaseDB();
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        role: 'user',
        status: 'active'
      });

      // Note: Subscriptions should ideally be handled by a backend trigger on user creation
      // or we can initialize a default one here if rules allow 'subscriptions' write.
      // For now, we'll stick to just the user profile to ensure basic login works.

    } catch (error: any) {
      console.error('Sign Up Error:', error);
      // Handle Firebase Auth specific error codes for better messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      }
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
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
