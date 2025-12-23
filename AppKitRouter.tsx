import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import DashboardView from './views/DashboardView';
import CreateClientView from './views/CreateClientView';
import ClientDetailView from './views/ClientDetailView';
import TemplatesView from './views/TemplatesView';
import ContentLabView from './views/ContentLabView';
import PromptGuideView from './views/PromptGuideView';
import DownloadsView from './views/DownloadsView';
import BillingView from './views/BillingView';
import Button from './components/Button';
import { getClients, getScheduledPosts, deletePost } from './services/dbService';
import { Client, Post } from './types';
import { appkitNavigate } from './utils/appkitUtils';

const AppKitRouter: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentHashPath, setCurrentHashPath] = useState(window.location.hash.substring(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHashPath(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingClients(true);
      setIsLoadingPosts(true);
      try {
        const [fetchedClients, fetchedPosts] = await Promise.all([
          getClients(),
          getScheduledPosts()
        ]);
        setClients(fetchedClients);
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to load local data", err);
      } finally {
        setIsLoadingClients(false);
        setIsLoadingPosts(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

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
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  }, [handleRefresh]);

  let content;
  const path = currentHashPath;

  if (path === '/' || path === '/dashboard' || path === '/settings') {
    content = (
      <DashboardView
        clients={clients}
        posts={posts}
        onDeletePost={handleDeletePost}
        isLoadingClients={isLoadingClients}
        isLoadingPosts={isLoadingPosts}
        onDataRefresh={handleRefresh}
      />
    );
  } else if (path === '/add-client') {
    content = <CreateClientView onClientAdded={handleClientAdded} />;
  } else if (path === '/templates') {
    content = <TemplatesView />;
  } else if (path === '/content-lab') {
    content = <ContentLabView />;
  } else if (path === '/prompt-guide') {
    content = <PromptGuideView />;
  } else if (path === '/downloads') {
    content = <DownloadsView />;
  } else if (path === '/billing') {
    content = <BillingView />;
  } else if (path.startsWith('/client/')) {
    const clientId = path.split('/')[2];
    content = <ClientDetailView clientId={clientId} onPostScheduled={handlePostScheduled} />;
  } else {
    content = (
      <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto text-center text-gray-400">
        <h1 className="text-3xl font-bold mb-4 text-white">404 - Page Not Found</h1>
        <p className="mb-6">The requested page could not be found.</p>
        <Button variant="primary" onClick={() => appkitNavigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black flex-col md:flex-row">
      <Navbar clients={clients} />
      <div className="flex-1 flex flex-col overflow-auto">
        {content}
      </div>
    </div>
  );
};

export default AppKitRouter;
