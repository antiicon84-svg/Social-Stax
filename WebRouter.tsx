import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';

import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import CreateClientView from './views/CreateClientView';
import ClientDetailView from './views/ClientDetailView';
import DownloadsView from './views/DownloadsView';
import TemplatesView from './views/TemplatesView';
import ContentLabView from './views/ContentLabView'; 
import PromptGuideView from './views/PromptGuideView'; // Import
import BillingView from './views/BillingView';
import Button from './components/Button';
import { getClients, getScheduledPosts, deletePost } from './services/dbService'; 
import { Client, Post } from './types';

const ClientDetailWrapper: React.FC<{ onPostScheduled: () => void }> = ({ onPostScheduled }) => {
  const { clientId } = useParams<{ clientId: string }>();
  if (!clientId) return null;
  return <ClientDetailView clientId={clientId} onPostScheduled={onPostScheduled} />;
};

const WebRouter: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const navigate = useNavigate();

  // Fetch Data
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

  return (
    <div className="flex min-h-screen bg-black flex-col md:flex-row">
      <Navbar clients={clients} />
      <div className="flex-1 flex flex-col overflow-auto">
        <Routes>
          <Route path="/" element={
              <DashboardView
                clients={clients}
                posts={posts}
                onDeletePost={handleDeletePost}
                isLoadingClients={isLoadingClients}
                isLoadingPosts={isLoadingPosts}
                onDataRefresh={handleRefresh}
              />
          } />
          <Route path="/add-client" element={
            <CreateClientView onClientAdded={handleClientAdded} />
          } />
          <Route path="/client/:clientId" element={
            <ClientDetailWrapper onPostScheduled={handlePostScheduled} />
          } />
          <Route path="/templates" element={
            <TemplatesView />
          } />
          <Route path="/content-lab" element={
            <ContentLabView />
          } />
          <Route path="/prompt-guide" element={
            <PromptGuideView />
          } />
          <Route path="/settings" element={
             <DashboardView
                clients={clients}
                posts={posts}
                onDeletePost={handleDeletePost}
                isLoadingClients={isLoadingClients}
                isLoadingPosts={isLoadingPosts}
                onDataRefresh={handleRefresh}
              />
          } />
          <Route path="/billing" element={
            <BillingView />
          } />
          <Route path="/downloads" element={
            <DownloadsView />
          } />
          <Route path="*" element={
               <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto text-center text-gray-400">
                <h1 className="text-3xl font-bold mb-4 text-white">404 - Page Not Found</h1>
                <p className="mb-6">The requested page could not be found.</p>
                <Button variant="primary" onClick={() => navigate('/')}>Go to Dashboard</Button>
              </div>
           } />
        </Routes>
      </div>
    </div>
  );
};

export default WebRouter;