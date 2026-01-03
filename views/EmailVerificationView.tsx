import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '~/services/firebaseConfig';

const EmailVerificationView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Extract the verification code from URL parameters
        const code = searchParams.get('oobCode');
        const mode = searchParams.get('mode');

        if (!code) {
          setStatus('error');
          setMessage('Invalid verification link. No code provided.');
          return;
        }

        if (mode !== 'verifyEmail') {
          setStatus('error');
          setMessage('Invalid request type.');
          return;
        }

        // Verify the code is valid before applying
        try {
          await checkActionCode(auth, code);
        } catch (checkError: any) {
          console.error('Invalid or expired code:', checkError);
          setStatus('error');
          setMessage('This verification link has expired or is invalid. Please request a new verification email.');
          return;
        }

        // Apply the verification code
        await applyActionCode(auth, code);
        
        setStatus('success');
        setMessage('✓ Your email has been verified successfully!');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        
        // Provide specific error messages based on Firebase error codes
        if (error.code === 'auth/invalid-action-code') {
          setMessage('This verification link has expired. Please request a new one.');
        } else if (error.code === 'auth/expired-action-code') {
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setMessage('Failed to verify email. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-2xl">
        {status === 'loading' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-white">{message}</h1>
            <p className="text-sm text-gray-400">Please wait while we verify your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">{message}</h1>
            <p className="text-sm text-gray-400">Redirecting you to the dashboard in 3 seconds...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-gray-400">{message}</p>
            <button onClick={() => navigate('/')} className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationView;