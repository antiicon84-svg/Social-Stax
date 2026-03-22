import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Rocket, Lock, User, Loader2, Phone, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

const LoginView: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signUp, loginGuest, loginWithGoogle } = useAuth();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const getGoogleAuthErrorMessage = (err: Error): string => {
    const code = (err as { code?: string; message?: string })?.code || err?.message || '';
    if (code.includes('operation-not-allowed')) {
      return 'Google Sign-In is not enabled. Please enable it in Firebase Console under Authentication → Sign-in providers.';
    }
    if (code.includes('unauthorized-domain')) {
      return 'This domain is not authorized for Google Sign-In. Add it in Firebase Console → Authentication → Settings → Authorized domains.';
    }
    if (code.includes('popup-blocked')) {
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'Sign-in was cancelled.';
    }
    if (code.includes('network-request-failed')) {
      return 'Network error. Please check your connection.';
    }
    return err?.message || 'Failed to sign in with Google.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const code = error?.code || (error as Error)?.message || '';
      if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('invalid-login-credentials')) {
        setError('No account found with this email. Please sign up first.');
      } else if (code.includes('wrong-password')) {
        setError('Incorrect password. Please try again.');
      } else if (code.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        const message = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email || !validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await signUp(email, password, name.trim(), phone.trim());
      navigate('/');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const code = error?.code || (error as Error)?.message || '';
      if (code.includes('email-already-in-use')) {
        setError('An account with this email already exists. Please sign in instead.');
        setMode('signin');
      } else {
        const message = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      setError(getGoogleAuthErrorMessage(error as Error));
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
    } catch {
      setError('Failed to continue as guest.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 pt-8 md:px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
            <Rocket size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Social StaX</h1>
            <p className="text-xs text-gray-500 hidden sm:block">A-Iconic&apos;s all-in-one Marketing Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={14} className="text-green-500" />
          <span>Secure & Encrypted</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-12" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="w-full max-w-sm">
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-gray-900/80 rounded-2xl p-1 border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Card */}
          <div className="bg-gray-950/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(220,38,38,0.08)] backdrop-blur-xl relative overflow-hidden">
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40 mt-px" />

            {/* Icon & Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                <Lock size={28} className="text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {mode === 'signin' ? 'Welcome Back' : 'Join Social StaX'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'signin' ? 'Sign in to your workspace' : 'Create your account to get started'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 mb-5 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mb-4 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-950 px-4 text-gray-600 font-bold tracking-widest">or</span>
              </div>
            </div>

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-600 text-center">
                  One account per email. By signing up you agree to our terms of service.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Guest option */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-950 px-4 text-gray-600 font-bold tracking-widest">or</span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium py-3 rounded-xl border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <User size={16} className="text-gray-500" />
              Continue as Guest
            </button>

            <p className="text-xs text-gray-700 text-center mt-5">
              Your data is encrypted and secure. One account per email address enforced.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginView;
