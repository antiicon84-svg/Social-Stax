import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailWithCode, resendVerificationEmail, isEmailVerified } from '~/services/authService';
import { useAuth } from '@/context/AuthContext';

const EmailVerificationHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      console.log('Email action handler - mode:', mode, 'oobCode:', oobCode);

      if (!mode || !oobCode) {
        setStatus('error');
        setMessage('Invalid verification link. Missing parameters.');
        setCanResend(true);
        return;
      }

      if (mode === 'verifyEmail') {
        try {
          await verifyEmailWithCode(oobCode);
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } catch (error: any) {
          console.error('Email verification error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to verify email. Please try again.');
          setCanResend(true);
        }
      } else if (mode === 'resetPassword') {
        // Handle password reset (you can implement this separately)
        navigate(`/reset-password?oobCode=${oobCode}`);
      } else {
        setStatus('error');
        setMessage('Unknown action mode.');
      }
    };

    handleVerification();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      setMessage('Verification email has been resent! Please check your inbox.');
      setStatus('success');
      setCanResend(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              {canResend && (
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  Resend Verification Email
                </button>
              )}
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationHandler;
