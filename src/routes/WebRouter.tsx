import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DashboardView from '~/views/DashboardView';
import AllClientsView from '~/views/AllClientsView';
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
import LoginView from '~/views/LoginView';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '../context/AuthContext';
import SettingsView from '~/views/SettingsView';
import VerifyEmailView from '~/views/VerifyEmailView';
import EmailVerificationView from '~/views/EmailVerificationView';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: isAuthLoading, currentUser } = useAuth();
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
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      // Unauthenticated users can ONLY access login and signup
      if (!['/login', '/signup'].includes(location.pathname)) {
        navigate('/login');
      }
    } else {
      // Check for email verification (skip for Guest users)
      const isGuest = currentUser?.email === 'guest@socialstax.app';

      // Allow access to verification pages if unverified
      if (!isGuest && !currentUser?.emailVerified) {
        if (!['/verify-email', '/verify-process'].includes(location.pathname)) {
          navigate('/verify-email');
        }
      } else if (currentUser?.emailVerified && ['/verify-email', '/verify-process'].includes(location.pathname)) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAuthLoading, navigate, location.pathname, currentUser]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }


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
      {!['/login', '/signup', '/verify-email', '/verify-process'].includes(location.pathname) && <Navbar clients={clients} />}
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
              <Route path="/login" element={<LoginView />} />
              <Route path="/" element={<DashboardView {...dashboardProps} />} />
              <Route path="/clients" element={<AllClientsView />} />
              <Route path="/add-client" element={<CreateClientView onClientAdded={handleClientAdded} />} />
              <Route path="/client/:clientId" element={<ClientDetailWrapper onPostScheduled={handlePostScheduled} />} />
              <Route path="/templates" element={<TemplatesView />} />
              <Route path="/content-lab" element={<ContentLabView />} />
              <Route path="/prompt-guide" element={<PromptGuideView />} />
              <Route path="/billing" element={<BillingView />} />
              <Route path="/downloads" element={<DownloadsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/admin" element={<AdminPanel />} />
<<<<<<< HEAD
              <Route path="/verify-email" element={<VerifyEmailView />} />
              <Route path="/verify-process" element={<EmailVerificationView />} />
=======
                            <Route path="/auth/verify-email" element={<EmailVerificationView />} />
                                    <Route path="/action" element={<EmailVerificationView />} />
>>>>>>> 23e36548f7dff2b8a6ca45c30bf065e3038c93db
              <Route path="*" element={<ErrorFallback />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default WebRouter;
