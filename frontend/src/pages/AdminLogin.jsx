import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { login, isAuthenticated, demoCredentials } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
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
    // Simulate brief delay for UX
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 400);
  };

  const fillDemoCredentials = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-white/50 mt-1">SRKR Cafeteria Management</p>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Demo Environment</p>
            <p className="text-xs text-amber-400/60 mt-0.5">
              This is a frontend-only demo. Authentication is simulated and does not provide real security.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@srkrcafeteria.demo"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors"
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

          {/* Demo Credentials Helper */}
          <div className="text-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Use Demo Credentials
            </button>
            <p className="text-[10px] text-charcoal-muted mt-1">
              Email: {demoCredentials.email}<br />
              Password: {demoCredentials.password}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
