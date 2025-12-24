import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail, signInWithEmail } from '../services/authService';
import Button from '../components/Button';

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain uppercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain number';
    if (!/[!@#$%^&*]/.test(pwd)) return 'Password must contain special character (!@#$%^&*)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (adminMode) {
      if (!email || !password || !adminSecret) {
        setError('Please fill all admin fields');
        return;
      }
      
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@socialstax.local';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'AdminPassword123!';
      const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY || 'dev_admin_secret_key_change_me_in_production';

      if (email !== adminEmail || password !== adminPassword || adminSecret !== secretKey) {
        setError('Invalid admin credentials');
        return;
      }

      localStorage.setItem('isAdmin', 'true');
      navigate('/');
      return;
    }

    if (isSignUp) {
      if (!email || !password || !name || !agreeTerms) {
        setError('Please fill all fields and agree to terms');
        return;
      }
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-lg mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Social Stax</h1>
            <p className="text-gray-400 mt-2">AI-Powered Social Media Management</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin Mode Toggle */}
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => {
                  setAdminMode(!adminMode);
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className="text-xs text-gray-400 hover:text-gray-300 underline"
              >
                {adminMode ? 'Back to User Login' : 'Admin Access'}
              </button>
            </div>

            {adminMode ? (
              // Admin Login Form
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    placeholder="admin@socialstax.local"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    placeholder="AdminPassword123!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Secret Key</label>
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    placeholder="Secret key"
                  />
                </div>
              </>
            ) : (
              // User Login/Signup Form
              <>
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      placeholder="Your name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    placeholder="••••••••"
                  />
                  {isSignUp && password && (
                    <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-700/50 rounded">
                      Password must have: 8+ chars, uppercase, number, special char (!@#$%^&*)
                    </p>
                  )}
                </div>
                {isSignUp && (
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to the Terms & Conditions
                    </label>
                  </div>
                )}
              </>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : adminMode ? 'Admin Login' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          {!adminMode && (
            <div className="mt-6 text-center text-sm text-gray-400">
              {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="ml-2 text-red-500 hover:text-red-400 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-700/30 rounded border border-gray-700 text-xs text-gray-300">
            <p className="font-semibold text-gray-200 mb-2">🧪 Testing Credentials:</p>
            <p>Email: test@example.com</p>
            <p>Password: TestPass123!</p>
            <p className="mt-2 text-gray-400">Or create a new account to get a 14-day free trial</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
