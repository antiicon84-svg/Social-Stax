import { auth_instance as auth, db_instance as db } from '@/config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  type User as FirebaseUser,
  type ActionCodeSettings,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { UserProfile as User } from '../types';

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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await mapFirebaseUserToAppUser(userCredential.user);
    return appUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Guest Login function
export const loginGuest = async (): Promise<User | null> => {
  try {
    const userCredential = await signInAnonymously(auth);
    // Create a basic user record for the guest
    await createUserRecord(userCredential.user.uid, 'guest@socialstax.app', false, 'Guest User');
    const appUser = await mapFirebaseUserToAppUser(userCredential.user);
    return appUser;
  } catch (error) {
    console.error('Guest login error:', error);
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
  isAdmin: boolean = false,
  displayName: string = ''
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
        displayName,
        role: isAdmin ? 'admin' : 'user',
        planTier: 'free',
        credits: 100,
        creditsUsed: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        autoDeleteGeneratedContent: false,
        storageUsed: 0,
        emailVerified: false,
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
  } catch (error) {
    console.error('Error creating user record:', error);
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async (user: FirebaseUser): Promise<void> => {
  try {
    // Get the current domain
    const currentUrl = window.location.origin;
    
    const actionCodeSettings: ActionCodeSettings = {
      url: `${currentUrl}/auth/verify-email`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    console.log('Verification email sent to:', user.email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Verify email with action code
export const verifyEmailWithCode = async (actionCode: string): Promise<void> => {
  try {
    // Validate the action code
    await checkActionCode(auth, actionCode);
    
    // Apply the email verification
    await applyActionCode(auth, actionCode);
    
    // Update user record in Firestore
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        emailVerified: true,
        updatedAt: serverTimestamp(),
      });
      
      // Reload user to get updated emailVerified status
      await user.reload();
    }
    
    console.log('Email verified successfully');
  } catch (error: any) {
    console.error('Error verifying email:', error);
    if (error.code === 'auth/expired-action-code') {
      throw new Error('Verification link has expired. Please request a new one.');
    } else if (error.code === 'auth/invalid-action-code') {
      throw new Error('Invalid verification link. Please request a new one.');
    }
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendVerificationEmail(user);
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if current user's email is verified
export const isEmailVerified = (): boolean => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
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

    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Check if user should be admin
    const isAdmin = isAdminUser(email);

    // Create user record in Firestore
    await createUserRecord(user.uid, email, isAdmin, displayName);

    // Send verification email
    await sendVerificationEmail(user);

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
