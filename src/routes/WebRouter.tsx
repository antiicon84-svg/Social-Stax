import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet, useParams, useOutletContext } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DashboardView from '@/views/DashboardView';
import AllClientsView from '@/views/AllClientsView';
import CreateClientView from '@/views/CreateClientView';
import ClientDetailView from '@/views/ClientDetailView';
import DownloadsView from '@/views/DownloadsView';
import TemplatesView from '@/views/TemplatesView';
import ContentLabView from '@/views/ContentLabView';
import PromptGuideView from '@/views/PromptGuideView';
import BillingView from '@/views/BillingView';
import AdminPanel from '@/components/AdminPanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '../context/AuthContext';

import SettingsView from '@/views/SettingsView';
import EmailVerificationView from '@/views/EmailVerificationView';
import LoginView from '@/views/LoginView';
import SignupView from '@/views/SignupView';

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

const PrivateLayout: React.FC = () => {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    clients,
    posts,
    isLoadingClients,
    isLoadingPosts,
    loadError,
    handleRefresh,
    handleClientAdded,
    handlePostScheduled,
    handleDeletePost
  } = useClientData(isAuthenticated);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
            <Outlet context={{ 
              clients, 
              posts, 
              onDeletePost: handleDeletePost, 
              isLoadingClients, 
              isLoadingPosts, 
              onDataRefresh: handleRefresh,
              handleClientAdded,
              handlePostScheduled
            }} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

const DashboardViewWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  return <DashboardView {...context} />;
};

const CreateClientViewWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  return <CreateClientView onClientAdded={context.handleClientAdded} />;
};

const ClientDetailWrapper: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const context = useOutletContext<any>();
  if (!clientId) return null;
  return <ClientDetailView clientId={clientId} onPostScheduled={context.handlePostScheduled} />;
};

const WebRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<SignupView />} />
      <Route path="/auth/verify-email" element={<EmailVerificationView />} />
      <Route path="/action" element={<EmailVerificationView />} />

      {/* Private Routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/" element={<DashboardViewWrapper />} />
        <Route path="/clients" element={<AllClientsView />} />
        <Route path="/add-client" element={<CreateClientViewWrapper />} />
        <Route path="/client/:clientId" element={<ClientDetailWrapper />} />
        <Route path="/templates" element={<TemplatesView />} />
        <Route path="/content-lab" element={<ContentLabView />} />
        <Route path="/prompt-guide" element={<PromptGuideView />} />
        <Route path="/billing" element={<BillingView />} />
        <Route path="/downloads" element={<DownloadsView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<ErrorFallback />} />
    </Routes>
  );
};

export default WebRouter;
