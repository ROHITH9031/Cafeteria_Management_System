import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

export default function AdminLogin() {
  const { loginAdmin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated as admin
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    loginAdmin(email, password).then((result) => {
      if (result.success) {
        if (result.role !== 'admin') {
          setError('Admin access required. This account does not have administrative privileges.');
          setLoading(false);
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        setError(result.error || 'Invalid credentials');
      }
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 dark:from-charcoal dark:via-gray-900 dark:to-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-charcoal dark:text-white">Admin Login</h1>
          <p className="text-sm text-charcoal-muted dark:text-white/60 mt-1">SRKR Cafeteria Management</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Secure Backend Authentication</p>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Admin sessions are authenticated via JWTs against the cafeteria database.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-100 dark:border-slate-800">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@srkrcafeteria.demo"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
}
