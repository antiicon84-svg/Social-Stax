import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import { sendEmailVerification } from 'firebase/auth';
import { auth_instance } from '@/config/firebase';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

const VerifyEmailView: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleResend = async () => {
        if (!auth_instance) {
            setMessage({ type: 'error', text: 'Firebase Auth is not initialized. Please check your environment variables.' });
            return;
        }

        const user = auth_instance.currentUser;
        if (!user) {
            setMessage({ type: 'error', text: 'No user is currently logged in.' });
            return;
        }

        setSending(true);
        setMessage(null);
        try {
            // Configure redirect URL to point to the new handler route
            const actionCodeSettings = {
                url: `${window.location.origin}/verify-process`, // Points to /verify-process
                handleCodeInApp: true
            };
            await sendEmailVerification(user, actionCodeSettings);
            setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox (and spam folder).' });
        } catch (error: any) {
            console.error('Error sending verification email:', error);
            if (error.code === 'auth/too-many-requests') {
                setMessage({ type: 'error', text: 'Too many requests. Please wait a moment before trying again.' });
            } else {
                setMessage({ type: 'error', text: `Failed to send verification email: ${error.message}` });
            }
        } finally {
            setSending(false);
        }
    };

    const checkVerification = async () => {
        try {
            if (!auth_instance) {
                setMessage({ type: 'error', text: 'Firebase Auth is not initialized.' });
                return;
            }

            const user = auth_instance.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    window.location.reload(); // Force full reload to update context
                } else {
                    setMessage({ type: 'error', text: 'Email not verified yet. Please click the link in your email.' });
                }
            }
        } catch (error) {
            console.error("Error checking verification:", error);
            setMessage({ type: 'error', text: 'Failed to check verification status.' });
        }
    };

    // Auto-poll for verification status
    React.useEffect(() => {
        const interval = setInterval(async () => {
            const user = auth_instance.currentUser;
            if (user && !user.emailVerified) {
                await user.reload();
                if (user.emailVerified) {
                    window.location.reload();
                }
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 md:p-10 text-white">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-red-500" />
                </div>

                <h1 className="text-2xl font-bold">Verify Your Email</h1>

                <p className="text-gray-400">
                    We've sent a verification email to <span className="text-white font-semibold">{currentUser?.email}</span>.
                    Please click the link in that email to verify your account and access Social Stax.
                </p>

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/20 text-green-300 border border-green-800' : 'bg-red-900/20 text-red-300 border border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-3 pt-4">
                    <Button
                        variant="secondary"
                        onClick={handleResend}
                        disabled={sending}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        {sending ? 'Sending...' : 'Resend Verification Email'}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={checkVerification}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> I've Verified My Email
                    </Button>

                    <button
                        onClick={() => logout()}
                        className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 w-full mt-4 transition-colors"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailView;
