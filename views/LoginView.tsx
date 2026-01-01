import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Rocket, Lock, Menu, User, Loader2 } from 'lucide-react';

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signUp, loginGuest } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pwd: string) => pwd.length >= 6;

  const handleAccessDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) throw new Error('Email is required');
      if (!validateEmail(email)) throw new Error('Invalid email format');
      if (!password) throw new Error('Password is required');
      if (!validatePassword(password)) throw new Error('Password must be at least 6 characters');

      // Attempt Login first
      try {
        await login(email, password);
        navigate('/');
      } catch (loginErr: any) {
        // Check for specific error codes that indicate user doesn't exist
        const errorCode = loginErr.code || loginErr.message;
        
        // Firebase auth/user-not-found or auth/invalid-credential (sometimes used for missing users)
        if (errorCode.includes('user-not-found') || errorCode.includes('invalid-credential') || errorCode.includes('invalid-login-credentials')) {
           // This implies user might not exist, or wrong password. 
           // In a "smart" one-form flow, we check if they are trying to sign up.
           
           if (!name.trim()) {
             // User hasn't entered a name, so assume they might be new and need to provide it
             // OR they just typed the wrong password.
             // To match the screenshot behavior: "Please enter your name for the new profile."
             // We'll prompt them.
             
             // Use window.alert to match the screenshot exactly as requested
             window.alert("Please enter your name for the new profile.");
             nameInputRef.current?.focus();
             setLoading(false);
             return;
           } else {
             // Name is provided, try to Sign Up
             try {
               await signUp(email, password, name);
               navigate('/');
             } catch (signupErr: any) {
               // If signup fails (e.g. email already in use but wrong password was entered initially), handle that
               if (signupErr.message.includes('email-already-in-use')) {
                 throw new Error('Incorrect password for existing account.');
               }
               throw signupErr;
             }
           }
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginGuest();
      navigate('/');
    } catch (err: any) {
      setError('Failed to continue as guest.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      {/* Header Area */}
      <header className="flex justify-between items-center p-4 pt-8 md:px-6">
        <div className="flex items-center gap-3">
          <div className="text-red-500">
            <Rocket size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Social StaX</h1>
            <p className="text-xs text-gray-500 hidden sm:block">A-Iconic's 'all-in-one' Marketing Platform</p>
          </div>
        </div>
        <button className="text-white hover:text-gray-300 transition">
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 mt-8 md:mt-16">
        
        {/* Main Card */}
        <div className="w-full max-w-md bg-gray-950 border border-red-900/30 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden">
            {/* Subtle red glow effect at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
            
            {/* Lock Icon */}
            <div className="flex justify-center mb-4">
                <div className="text-red-500/80">
                    <Lock size={48} strokeWidth={1.5} />
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Sign In</h2>
                <p className="text-gray-500 text-sm">Access your secure local workspace</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 mb-6 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleAccessDashboard} className="space-y-5">
                
                {/* Email Field */}
                <div>
                    <label className="block text-gray-500 text-sm mb-2 font-medium">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                    />
                </div>

                {/* Password Field (Added for functionality) */}
                <div>
                    <label className="block text-gray-500 text-sm mb-2 font-medium">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                    />
                </div>

                {/* Name Field */}
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="block text-gray-500 text-sm font-medium">Name (For Profile)</label>
                    </div>
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name (Only needed for new signup)"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                    />
                </div>

                {/* Primary Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 mt-4 group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-slow group-hover:border-white transition-colors" style={{ animationDuration: '3s' }}></div>
                    )}
                    {loading ? 'Processing...' : 'Access Dashboard'}
                </button>

            </form>

            {/* Separator */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-950 px-4 text-gray-600 font-bold tracking-widest">OR</span>
                </div>
            </div>

            {/* Secondary Button */}
            <button 
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 rounded-xl border border-gray-800 transition-all flex items-center justify-center gap-3"
            >
                <User size={20} className="text-gray-400" />
                Continue as Guest
            </button>

            {/* Privacy Notice */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-600">Data is encrypted and stored locally on this device.</p>
            </div>

        </div>
      </main>
    </div>
  );
};

export default LoginView;
