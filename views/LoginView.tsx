import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LoginView: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signUp } = useAuth();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pwd: string) => pwd.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) throw new Error('All fields required');
      if (!validateEmail(email)) throw new Error('Invalid email format');
      if (!validatePassword(password)) throw new Error('Password min 6 characters');
      
      if (isSignUp) {
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        await signUp(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Authentication Error:', err);
      let errorMessage = err.message || 'Authentication failed';
      
      // Handle specific Firebase security error
      if (err.code === 'auth/requests-from-referer-blocked' || err.message.includes('requests-from-referer')) {
        errorMessage = 'Security Error: Your IP is blocked by Firebase. Please try accessing the app via http://localhost:3005 instead of the network IP.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please login instead.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 max-w-md w-full shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Social Stax</h1>
          <p className="text-gray-400">AI-Powered Social Media Management</p>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              !isSignUp ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              isSignUp ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
                disabled={loading}
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isSignUp ? 'Already have an account?' : 'Do not have an account?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-red-500 hover:text-red-400 ml-1 font-medium transition"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;