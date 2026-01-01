import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardView from '~/views/DashboardView';
import AllClientsView from '~/views/AllClientsView';
import CreateClientView from '~/views/CreateClientView';
import ClientDetailView from '~/views/ClientDetailView';
import TemplatesView from '~/views/TemplatesView';
import ContentLabView from '~/views/ContentLabView';
import PromptGuideView from '~/views/PromptGuideView';
import DownloadsView from '~/views/DownloadsView';
import BillingView from '~/views/BillingView';
import SettingsView from '~/views/SettingsView';
import VoiceAssistant from '@/components/VoiceAssistant';
import Button from '@/components/Button';
import { useClientData } from '@/hooks/useClientData';

const AppKitRouter: React.FC = () => {
  const {
    clients,
    posts,
    isLoadingClients,
    isLoadingPosts,
    handleRefresh,
    handleClientAdded,
    handlePostScheduled,
    handleDeletePost
  } = useClientData(true);
  
  const getPathFromHash = () => {
    const hash = window.location.hash.substring(1) || '/';
    return hash.startsWith('/') ? hash : '/' + hash;
  };

  const [currentHashPath, setCurrentHashPath] = useState(getPathFromHash());

  useEffect(() => {
    const initialPath = getPathFromHash();
    console.log('[AppKitRouter] Initial path:', initialPath);
    setCurrentHashPath(initialPath);

    const handleHashChange = () => {
      const newPath = getPathFromHash();
      console.log('[AppKitRouter] Hash changed to:', newPath);
      setCurrentHashPath(newPath);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const path = currentHashPath;
  console.log('[AppKitRouter] Rendering path:', path);

  let content;
  const normalizedPath = path.split('?')[0];
  if (normalizedPath === '/' || normalizedPath === '/dashboard') {
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
  } else if (normalizedPath === '/clients') {
    content = <AllClientsView />;
  } else if (normalizedPath === '/add-client') {
    content = <CreateClientView onClientAdded={handleClientAdded} />;
  } else if (normalizedPath === '/templates') {
    content = <TemplatesView />;
  } else if (normalizedPath === '/content-lab') {
    content = <ContentLabView />;
  } else if (normalizedPath === '/prompt-guide') {
    content = <PromptGuideView />;
  } else if (normalizedPath === '/downloads') {
    content = <DownloadsView />;
  } else if (normalizedPath === '/billing') {
    content = <BillingView />;
  } else if (normalizedPath === '/settings') {
    content = <SettingsView />;
  } else if (path.startsWith('/client/')) {
    const clientId = path.split('/')[2];
    content = <ClientDetailView clientId={clientId} onPostScheduled={handlePostScheduled} />;
  } else {
    content = (
      <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto text-center text-gray-400">
        <h1 className="text-3xl font-bold mb-4 text-white">404 - Page Not Found</h1>
        <p className="mb-6">The requested page could not be found. (Path: {path})</p>
        <Button variant="primary" onClick={() => { window.location.hash = '/'; }}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black flex-col md:flex-row">
      <VoiceAssistant />
      <Navbar clients={clients} />
      <div className="flex-1 flex flex-col overflow-auto">
        {content}
      </div>
    </div>
  );
};

export default AppKitRouter;
