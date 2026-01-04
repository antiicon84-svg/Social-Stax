import React, { useState } from 'react';
import { resendVerificationEmail, logoutUser } from '~/services/authService';
import { useAuth } from '@/context/AuthContext';

interface EmailVerificationPendingProps {
  onClose?: () => void;
}

const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleResendEmail = async () => {
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail();
      setMessage('Verification email has been resent! Please check your inbox.');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend email. Please try again.');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
        <div className="text-center">
          {/* Email Icon */}
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-indigo-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Verify Your Email</h2>

          {/* Message */}
          <p className="text-gray-600 mb-2">
            We've sent a verification email to:
          </p>
          <p className="text-indigo-600 font-semibold mb-6">{currentUser.email}</p>

          <p className="text-gray-600 mb-6">
            Please check your inbox and click the verification link to activate your account.
          </p>

          {/* Status Message */}
          {message && (
            <div
              className={`mb-6 p-3 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={sending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or click "Resend" to try again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
