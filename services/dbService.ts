import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  addDoc,
  getDocs,
  query,
  httpsCallable,
  where,
} from "firebase/firestore";
import { initializeApp, getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { FIREBASE_CONFIG } from "../constants";
import { Client, Post, UserProfile, FreeAccessGrant } from '../types';
import { getCurrentUser } from "./authService";

const db = getFirestore(getApp());

/**
 * DATABASE SERVICE
 * Interacts with Firebase Firestore for data persistence.
 */

/**
 * Gets the current authenticated user's UID and throws an error if not authenticated.
 * @returns The user's UID.
 */
const getAuthenticatedUid = (): string => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

export const getClients = async (): Promise<Client[]> => {
  const uid = getAuthenticatedUid();
  const clientsCol = collection(db, "users", uid, "clients");
  const clientSnapshot = await getDocs(clientsCol);
  return clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const saveClient = async (client: Client): Promise<void> => {
  const uid = getAuthenticatedUid();

  if (client.id) {
    // Update existing client
    const clientRef = doc(db, "users", uid, "clients", client.id);
    const { id, ...clientData } = client;
    await setDoc(clientRef, clientData, { merge: true });
  } else {
    // Create new client
    const clientsCol = collection(db, "users", uid, "clients");
    // Exclude a potential empty id from the document data
    const { id, ...clientData } = client;
    await addDoc(clientsCol, clientData);
  }
};

export const getScheduledPosts = async (): Promise<Post[]> => {
  const uid = getAuthenticatedUid();

  const postsCol = collection(db, "users", uid, "posts");
  const postSnapshot = await getDocs(postsCol);
  return postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
};

export const savePost = async (post: Post): Promise<void> => {
  const uid = getAuthenticatedUid();

  if (post.id) {
    const postRef = doc(db, "users", uid, "posts", post.id);
    const { id, ...postData } = post;
    await setDoc(postRef, postData, { merge: true });
  } else {
    const postsCol = collection(db, "users", uid, "posts");
    const { id, ...postData } = post;
    await addDoc(postsCol, postData);
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  const uid = getAuthenticatedUid();
  await deleteDoc(doc(db, "users", uid, "posts", postId));
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  const uid = getAuthenticatedUid();

  const clientRef = doc(db, "users", uid, "clients", id);
  const clientSnap = await getDoc(clientRef);
  return clientSnap.exists() ? { id: clientSnap.id, ...clientSnap.data() } as Client : undefined;
};

/**
 * Retrieves a user's profile data from Firestore.
 * @returns The user's profile data.
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const uid = getAuthenticatedUid();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn("User profile not found for UID:", uid);
    return null;
  }

  return userSnap.data() as UserProfile;
};

/**
 * Finds a user by their email address.
 * @param email The email of the user to find.
 * @returns The user's profile and UID, or null if not found.
 */
export const getUserByEmail = async (email: string): Promise<(UserProfile & { uid: string }) | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as UserProfile & { uid: string };
};

/**
 * Retrieves all free access grants. Intended for admin use.
 * @returns A list of all free access grants.
 */
export const getFreeAccessGrants = async (): Promise<FreeAccessGrant[]> => {
  // Note: This assumes the admin has appropriate Firestore security rules
  // to read the 'free_access' collection.
  const grantsCol = collection(db, "free_access");
  const grantsSnapshot = await getDocs(grantsCol);
  return grantsSnapshot.docs.map(doc => ({
    id: doc.id, ...doc.data()
  } as FreeAccessGrant));
};

/**
 * Creates a new free access grant for a user. This action can only be performed by an admin.
 * @param grant - The grant details, excluding system-generated fields like id and grantedAt.
 */
export const createFreeAccessGrant = async (grant: Omit<FreeAccessGrant, 'id' | 'grantedAt'>): Promise<void> => {
  const adminUid = getAuthenticatedUid();

  // First, verify the current user is an admin
  const adminProfile = await getUserProfile();
  if (adminProfile?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can grant free access.");
  }

  // Create the new grant document
  const grantsCol = collection(db, "free_access");
  const newGrantData = {
    ...grant,
    grantedAt: new Date(), // Set the grant timestamp
    grantedBy: adminUid, // Track which admin created the grant
  };

  await addDoc(grantsCol, newGrantData);
};

/**
 * Revokes a free access grant by deleting its document. This action can only be performed by an admin.
 * @param grantId - The ID of the grant document to be deleted.
 */
export const revokeFreeAccessGrant = async (grantId: string): Promise<void> => {
  // First, verify the current user is an admin.
  // getUserProfile handles the authentication check internally.
  const adminProfile = await getUserProfile();
  if (adminProfile?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can revoke grants.");
  }

  // Proceed to delete the grant document
  const grantRef = doc(db, "free_access", grantId);
  await deleteDoc(grantRef);
};

/**
 * Triggers the manualUsageReset Cloud Function to reset all user usage data.
 * This can only be successfully called by an authenticated admin.
 */
const functions = getFunctions(getApp());
export const triggerManualUsageReset = async (): Promise<{ message: string }> => {
  const resetFunction = httpsCallable(functions, 'manualusagereset');
  const result = await resetFunction();
  return result.data as { message: string };
};
