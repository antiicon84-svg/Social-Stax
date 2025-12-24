import { getDoc, setDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Usage } from '../types';

// Default usage limits per plan
const USAGE_LIMITS = {
 contentGenerations: 100,
 imageGenerations: 50,
 aiAnalysis: 200,
 emailCampaigns: 25,
};

/**
 * Check if a user can perform an action based on their current usage and plan
 */
export const canPerformAction = async (
 userProfile: UserProfile,
 usageType: keyof Omit<Usage, 'lastReset'>,
 amount: number = 1
): Promise<boolean> => {
 if (!userProfile.uid) {
 throw new Error('User profile must have a UID');
 }

 try {
 const userRef = doc(db, 'users', userProfile.uid);
 const userDoc = await getDoc(userRef);

 if (!userDoc.exists()) {
 // New user - initialize usage
 await initializeUserUsage(userProfile.uid);
 return true;
 }

 const userData = userDoc.data();
 const currentUsage = userData.usage?.[usageType] || 0;
 const limit = USAGE_LIMITS[usageType] || 100;

 return currentUsage + amount <= limit;
 } catch (error) {
 console.error('Error checking usage:', error);
 return false;
 }
};

/**
 * Increment usage for a specific action type
 */
export const incrementUsage = async (
 uid: string,
 usageType: keyof Omit<Usage, 'lastReset'>,
 amount: number = 1
): Promise<void> => {
 if (!uid) {
 throw new Error('UID is required to increment usage');
 }

 try {
 const userRef = doc(db, 'users', uid);
 const userDoc = await getDoc(userRef);

 if (userDoc.exists()) {
 const currentUsage = userDoc.data().usage?.[usageType] || 0;
 await updateDoc(userRef, {
 [`usage.${usageType}`]: currentUsage + amount,
 lastUpdated: new Date(),
 });
 } else {
 // Initialize if doesn't exist
 await initializeUserUsage(uid, { [usageType]: amount });
 }
 } catch (error) {
 console.error('Error incrementing usage:', error);
 throw error;
 }
};

/**
 * Initialize usage for a new user
 */
const initializeUserUsage = async (uid: string, initialUsage: Partial<Usage> = {}): Promise<void> => {
 try {
 const userRef = doc(db, 'users', uid);
 const usage: Usage = {
 contentGenerations: initialUsage.contentGenerations || 0,
 imageGenerations: initialUsage.imageGenerations || 0,
 aiAnalysis: initialUsage.aiAnalysis || 0,
 emailCampaigns: initialUsage.emailCampaigns || 0,
 lastReset: new Date(),
 };

 await setDoc(userRef, { usage, createdAt: new Date() }, { merge: true });
 } catch (error) {
 console.error('Error initializing user usage:', error);
 throw error;
 }
};

/**
 * Get current usage for a user
 */
export const getUserUsage = async (uid: string): Promise<Usage | null> => {
 if (!uid) {
 throw new Error('UID is required');
 }

 try {
 const userRef = doc(db, 'users', uid);
 const userDoc = await getDoc(userRef);

 if (userDoc.exists()) {
 return userDoc.data().usage || null;
 }
 return null;
 } catch (error) {
 console.error('Error getting user usage:', error);
 return null;
 }
};

/**
 * Reset usage for a user (typically done monthly)
 */
export const resetUserUsage = async (uid: string): Promise<void> => {
 if (!uid) {
 throw new Error('UID is required to reset usage');
 }

 try {
 const userRef = doc(db, 'users', uid);
 const resetUsage: Usage = {
 contentGenerations: 0,
 imageGenerations: 0,
 aiAnalysis: 0,
 emailCampaigns: 0,
 lastReset: new Date(),
 };

 await updateDoc(userRef, { usage: resetUsage });
 } catch (error) {
 console.error('Error resetting usage:', error);
 throw error;
 }
};
