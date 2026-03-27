import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, Loader2, Phone, Mail, Eye, EyeOff, Zap, BarChart2, Image, Mic } from 'lucide-react';

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
    if (code.includes('operation-not-allowed')) return 'Google Sign-In is not enabled. Please enable it in Firebase Console.';
    if (code.includes('unauthorized-domain')) return 'This domain is not authorized for Google Sign-In.';
    if (code.includes('popup-blocked')) return 'Popup was blocked. Please allow popups for this site.';
    if (code.includes('popup-closed-by-user')) return 'Sign-in was cancelled.';
    if (code.includes('network-request-failed')) return 'Network error. Please check your connection.';
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
        setError((error as Error)?.message || 'Sign in failed. Please try again.');
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
        setError((error as Error)?.message || 'Sign up failed. Please try again.');
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
      setError(getGoogleAuthErrorMessage(err as Error));
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

  const features = [
    { icon: BarChart2, label: 'Smart Scheduling', desc: 'AI-optimised post timing' },
    { icon: Image, label: 'Content Generation', desc: 'Imagen & Gemini powered' },
    { icon: Mic, label: 'Voice Assistant', desc: 'Hands-free navigation' },
    { icon: Zap, label: 'Multi-Platform', desc: 'All channels in one place' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex overflow-hidden">

      {/* ── Background grid ── */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Ambient glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-red-900/5 rounded-full blur-[80px]" />
      </div>

      {/* ════════════════════════════════════════
          LEFT BRAND PANEL  (hidden on mobile)
      ════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 xl:p-16">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-900/40">
            <Zap size={17} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Social StaX</span>
          <span className="text-[10px] text-gray-600 ml-1 mt-0.5 uppercase tracking-widest hidden xl:block">by A-Iconic Creations</span>
        </div>

        {/* Centre hero */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Large logo mark */}
          <div className="mb-10 relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(220,38,38,0.15)]">
              {/* A-Iconic triangle mark */}
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M22 4L40 38H4L22 4Z" stroke="url(#tri)" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <circle cx="22" cy="26" r="6" stroke="url(#tri)" strokeWidth="1.5" fill="none"/>
                <line x1="22" y1="20" x2="22" y2="16" stroke="url(#tri)" strokeWidth="1.5"/>
                <defs>
                  <linearGradient id="tri" x1="4" y1="4" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444"/>
                    <stop offset="1" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Your brand.<br />
              <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                Amplified.
              </span>
            </h1>
            <p className="mt-4 text-gray-400 text-base leading-relaxed max-w-sm">
              The all-in-one AI marketing platform that writes, schedules, and publishes for you — while you focus on what matters.
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600/20 to-purple-600/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-700">© 2025 A-Iconic Creations. All rights reserved.</p>
      </div>

      {/* ════════════════════════════════════════
          RIGHT FORM PANEL
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 relative">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-base font-bold">Social StaX</span>
        </div>

        <div className="w-full max-w-[400px]">

          {/* Mode toggle */}
          <div className="flex mb-7 bg-white/[0.04] rounded-2xl p-1 border border-white/[0.07]">
            {(['signin', 'signup'] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-red-900/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="relative bg-white/[0.03] border border-white/[0.09] rounded-3xl p-7 sm:p-8 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'signin'
                  ? 'Sign in to your workspace'
                  : 'Create your free account today'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mb-5 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm shadow-sm disabled:opacity-60"
            >
              <svg width="17" height="17" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.226 17.64 11.92 17.64 9.2z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <InputField
                  icon={<Mail size={15} />}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                />
                <InputField
                  icon={<Lock size={15} />}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  suffix={
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in…" />
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <InputField icon={<User size={15} />} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
                <InputField icon={<Mail size={15} />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" />
                <InputField icon={<Phone size={15} />} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number (optional)" autoComplete="tel" />
                <InputField
                  icon={<Lock size={15} />}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min. 8 chars)"
                  autoComplete="new-password"
                  suffix={
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <InputField
                  icon={<Lock size={15} />}
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account…" />
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold">or</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Guest */}
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200 font-medium py-3 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              <User size={15} className="text-gray-500" />
              Continue as Guest
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-gray-700 mt-5">
            End-to-end encrypted · One account per email enforced
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Shared input component ── */
interface InputFieldProps {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ icon, type, value, onChange, placeholder, autoComplete, suffix }) => (
  <div className="relative group">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-400 transition-colors">
      {icon}
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:bg-white/[0.06] transition-all"
    />
    {suffix && (
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</span>
    )}
  </div>
);

/* ── Submit button ── */
const SubmitButton: React.FC<{ loading: boolean; label: string; loadingLabel: string }> = ({ loading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full relative bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40 flex items-center justify-center gap-2 mt-1 disabled:opacity-70 overflow-hidden group"
  >
    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    {loading ? <Loader2 className="animate-spin" size={17} /> : null}
    {loading ? loadingLabel : label}
  </button>
);

export default LoginView;
