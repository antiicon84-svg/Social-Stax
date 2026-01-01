import { useState, useEffect, useCallback } from 'react';
import { getClients, getScheduledPosts, deletePost } from '~/services/dbService';
import { Client, Post } from '~/types';

export function useClientData(isAuthenticated: boolean) {
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setClients([]);
      setPosts([]);
      setIsLoadingClients(false);
      setIsLoadingPosts(false);
      return;
    }

    const fetchData = async () => {
      console.log('[useClientData] Fetching data...');
      setIsLoadingClients(true);
      setIsLoadingPosts(true);
      setLoadError(null);
      try {
        const [fetchedClients, fetchedPosts] = await Promise.all([
          getClients(),
          getScheduledPosts()
        ]);
        setClients(fetchedClients);
        setPosts(fetchedPosts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        console.error("[useClientData] Failed to load data:", err);
        setLoadError(errorMessage);
      } finally {
        setIsLoadingClients(false);
        setIsLoadingPosts(false);
      }
    };
    fetchData();
  }, [refreshTrigger, isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleClientAdded = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handlePostScheduled = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        handleRefresh();
      } catch (error) {
        console.error('[useClientData] Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  }, [handleRefresh]);

  return {
    clients,
    posts,
    isLoadingClients,
    isLoadingPosts,
    loadError,
    handleRefresh,
    handleClientAdded,
    handlePostScheduled,
    handleDeletePost
  };
}
