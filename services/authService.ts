import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../constants';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Persistence error:', error);
});

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  displayName?: string;
}

// Login function
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const role = userData?.role || 'user';

    return {
      uid: user.uid,
      email: user.email || '',
      role,
      createdAt: user.metadata?.creationTime || new Date(),
      displayName: user.displayName || undefined
    };
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
export const createUserRecord = async (uid: string, email: string, isAdmin: boolean = false): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
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
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
