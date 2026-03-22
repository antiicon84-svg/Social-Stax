import { getFirebaseAuth, getFirebaseDB } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { UserProfile as User } from '../types';

// Helper to get auth instance safely
const getAuth = () => getFirebaseAuth();
const getDB = () => getFirebaseDB();

// Helper function to map Firebase user to app User type
const mapFirebaseUserToAppUser = async (fbUser: FirebaseUser): Promise<User> => {
  const db = getDB();
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);

  let createdAt: Date;
  let role: 'admin' | 'user' = 'user';
  let planTier: 'free' | 'starter' | 'pro' | 'enterprise' = 'free';
  let credits = 0;
  let creditsUsed = 0;
  let autoDeleteGeneratedContent = false;
  let storageUsed = 0;

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
    if (data.role === 'admin') {
      role = 'admin';
    }
    planTier = data.planTier || 'free';
    credits = data.credits || 0;
    creditsUsed = data.creditsUsed || 0;
    autoDeleteGeneratedContent = data.autoDeleteGeneratedContent || false;
    storageUsed = data.storageUsed || 0;
  } else {
    createdAt = new Date();
  }

  return {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? '',
    photoURL: fbUser.photoURL ?? '',
    createdAt,
    role,
    planTier,
    credits,
    creditsUsed,
    autoDeleteGeneratedContent,
    storageUsed,
  };
};

// Login function
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUserToAppUser(userCredential.user);
};

// Guest Login function
export const loginGuest = async (): Promise<User | null> => {
  const auth = getAuth();
  const userCredential = await signInAnonymously(auth);
  await createUserRecord(userCredential.user.uid, 'guest@socialstax.app', false, 'Guest User');
  return mapFirebaseUserToAppUser(userCredential.user);
};

// Check if admin
export const isAdminUser = (email: string): boolean => {
  return email === import.meta.env.VITE_ADMIN_EMAIL;
};

// Create user record
export const createUserRecord = async (
  uid: string,
  email: string,
  isAdmin: boolean = false,
  displayName: string = '',
  phone: string = ''
): Promise<void> => {
  const db = getDB();
  const userRef = doc(db, 'users', uid);
  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

  await setDoc(
    userRef,
    {
      uid,
      email,
      displayName,
      phoneNumber: phone,
      role: isAdmin ? 'admin' : 'user',
      planTier: 'free',
      credits: 100,
      creditsUsed: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      autoDeleteGeneratedContent: false,
      storageUsed: 0,
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
        lastReset: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

// Get current user
export const getCurrentUser = () => {
  try {
    const auth = getAuth();
    return auth.currentUser;
  } catch {
    return null;
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  const auth = getAuth();
  await signOut(auth);
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string,
  phone?: string
): Promise<User> => {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  const isAdmin = isAdminUser(email);
  await createUserRecord(user.uid, email, isAdmin, displayName, phone);
  return mapFirebaseUserToAppUser(user);
};

// Sign in with Google
export const loginWithGoogle = async (): Promise<User> => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  let userCredential;
  try {
    userCredential = await signInWithPopup(auth, provider);
  } catch (popupError: unknown) {
    const error = popupError as { code?: string };
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, provider);
      throw new Error('Redirecting for Google sign-in...');
    }
    throw popupError;
  }

  const user = userCredential.user;
  const admin = isAdminUser(user.email ?? '');
  await createUserRecord(user.uid, user.email ?? '', admin, user.displayName ?? '', user.phoneNumber ?? '');
  return mapFirebaseUserToAppUser(user);
};

// Handle Google redirect result on app load
export const handleGoogleRedirectResult = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const user = result.user;
      const isAdmin = isAdminUser(user.email ?? '');
      await createUserRecord(user.uid, user.email ?? '', isAdmin, user.displayName ?? '', user.phoneNumber ?? '');
    }
  } catch (error) {
    console.error('Google redirect result error:', error);
  }
};

// Sign in with email and password (alias)
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};
