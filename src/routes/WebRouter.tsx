import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LoginView from '~/views/LoginView';
import DashboardView from '~/views/DashboardView';
import CreateClientView from '~/views/CreateClientView';
import ClientDetailView from '~/views/ClientDetailView';
import DownloadsView from '~/views/DownloadsView';
import TemplatesView from '~/views/TemplatesView';
import ContentLabView from '~/views/ContentLabView';
import PromptGuideView from '~/views/PromptGuideView';
import BillingView from '~/views/BillingView';
import AdminPanel from '@/components/AdminPanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import VoiceAssistant from '@/components/VoiceAssistant';
import { getClients, getScheduledPosts, deletePost } from '~/services/dbService';
import { Client, Post } from '~/types';
import { useAuth } from '../context/AuthContext';

const ClientDetailWrapper: React.FC<{ onPostScheduled: () => void }> = ({ onPostScheduled }) => {
  const { clientId } = useParams<{ clientId: string }>();
  if (!clientId) return null;
  return <ClientDetailView clientId={clientId} onPostScheduled={onPostScheduled} />;
};

const ErrorFallback: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto text-center text-gray-400">
      <h1 className="text-3xl font-bold mb-4 text-white">404 - Page Not Found</h1>
      <p className="mb-6">The requested page could not be found.</p>
      <Button variant="primary" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </div>
  );
};

const WebRouter: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const location = useLocation();

  // Use AuthContext
  const { isAuthenticated, loading: isAuthLoading } = useAuth();

  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      console.log('[WebRouter] Fetching data...');
      setIsLoadingClients(true);
      setIsLoadingPosts(true);
      setLoadError(null);
      try {
        const [fetchedClients, fetchedPosts] = await Promise.all([
          getClients(),
          getScheduledPosts()
        ]);
        console.log('[WebRouter] Data fetched successfully:', { 
          clients: fetchedClients.length, 
          posts: fetchedPosts.length 
        });
        setClients(fetchedClients);
        setPosts(fetchedPosts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        console.error("Failed to load local data:", err);
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
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  }, [handleRefresh]);

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    console.log('[WebRouter] Not authenticated, redirecting to login');
    return (
      <Routes>
        <Route path="*" element={<LoginView />} />
      </Routes>
    );
  }

  // Shared dashboard props
  const dashboardProps = {
    clients,
    posts,
    onDeletePost: handleDeletePost,
    isLoadingClients,
    isLoadingPosts,
    onDataRefresh: handleRefresh,
  };

  console.log('[WebRouter] Rendering main layout. Path:', location.pathname);
  
  return (
    <div className="flex min-h-screen bg-black flex-col md:flex-row">
      <VoiceAssistant />
      <Navbar clients={clients} />
      <div className="flex-1 flex flex-col overflow-auto relative">
        {loadError && (
          <div className="bg-red-900 text-red-100 p-4 m-4 rounded z-50 relative">
            <p className="font-semibold">Error loading data:</p>
            <p className="text-sm">{loadError}</p>
          </div>
        )}
        <div className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DashboardView {...dashboardProps} />} />
              <Route path="/add-client" element={<CreateClientView onClientAdded={handleClientAdded} />} />
              <Route path="/client/:clientId" element={<ClientDetailWrapper onPostScheduled={handlePostScheduled} />} />
              <Route path="/templates" element={<TemplatesView />} />
              <Route path="/content-lab" element={<ContentLabView />} />
              <Route path="/prompt-guide" element={<PromptGuideView />} />
              <Route path="/billing" element={<BillingView />} />
              <Route path="/downloads" element={<DownloadsView />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<ErrorFallback />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default WebRouter;
