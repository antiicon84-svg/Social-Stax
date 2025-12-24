import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import type { User } from '../types';

// Set up auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    console.log('User is authenticated:', firebaseUser.uid);
  } else {
    console.log('User is logged out');
  }
});

// Helper function to map Firebase user to app User type
const mapFirebaseUserToAppUser = async (fbUser: FirebaseUser): Promise<User> => {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);

  let createdAt: Date;

  if (snap.exists()) {
    const data = snap.data();
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt.toDate();
    } else if (typeof data.createdAt === 'string') {
      createdAt = new Date(data.createdAt);
    } else if (data.createdAt instanceof Date) {
      createdAt = data.createdAt;
    } else {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }

  return {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? '',
    photoURL: fbUser.photoURL ?? '',
    createdAt,
  };
};

// Login function
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await mapFirebaseUserToAppUser(userCredential.user);
    return appUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Check if admin
export const isAdminUser = (email: string): boolean => {
  return email === import.meta.env.VITE_ADMIN_EMAIL;
};

// Create user record
export const createUserRecord = async (
  uid: string,
  email: string,
  isAdmin: boolean = false
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

    await setDoc(
      userRef,
      {
        uid,
        email,
        role: isAdmin ? 'admin' : 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        subscription: {
          status: 'trial',
          plan: 'starter',
          expiresAt: Timestamp.fromDate(trialExpiresAt),
          autoRenew: false,
        },
        usage: {
          contentGenerations: 0,
          imageGenerations: 0,
          voiceAssistantMinutes: 0,
          apiCalls: 0,
          lastReset: Timestamp.now(),
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error creating user record:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user record in Firestore
    await createUserRecord(user.uid, email, false);

    // Map to app User type
    const appUser = await mapFirebaseUserToAppUser(user);
    return appUser;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};
