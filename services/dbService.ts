import { Client, Post } from '../types';

// Storage keys
const CLIENTS_KEY = 'social_stax_clients';
const POSTS_KEY = 'social_stax_posts';

/**
 * MOCK DATABASE SERVICE
 * In a real app, these would interact with Firebase Firestore.
 * We use localStorage as a fallback/mock for now.
 */

export const getClients = async (): Promise<Client[]> => {
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
};Feat: Add dbService.ts with localStorage mock persistence

export const saveClient = async (client: Client): Promise<void> => {
  const clients = await getClients();
  const updated = [...clients, { ...client, id: client.id || Date.now().toString() }];
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
};

export const getScheduledPosts = async (): Promise<Post[]> => {
  const data = localStorage.getItem(POSTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePost = async (post: Post): Promise<void> => {
  const posts = await getScheduledPosts();
  const updated = [...posts, { ...post, id: post.id || Date.now().toString() }];
  localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
};

export const deletePost = async (postId: string): Promise<void> => {
  const posts = await getScheduledPosts();
  const updated = posts.filter(p => p.id !== postId);
  localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  const clients = await getClients();
  return clients.find(c => id === c.id || id === c.name);
};
