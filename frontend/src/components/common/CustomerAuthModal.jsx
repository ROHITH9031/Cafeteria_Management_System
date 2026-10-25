import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User, Hash, Phone, AlertCircle, Loader2 } from 'lucide-react';

export default function CustomerAuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    contactInfo: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    if (isRegister && !form.name.trim()) {
      setError('Name is required to register.');
      return;
    }

    if (isRegister && form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await register(form);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await login(form.email, form.password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-charcoal-muted dark:text-slate-400"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-white">
            {isRegister ? 'Create an Account' : 'Student Sign In'}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
            {isRegister
              ? 'Register to save your orders and track real-time pickup status'
              : 'Sign in to access your order history and live tokens'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-charcoal dark:text-slate-200 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal dark:text-slate-200 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@srkr.edu.in"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-slate-200 mb-1">
                  Student ID / Roll No <span className="text-charcoal-muted dark:text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="22B01A05XX"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal dark:text-slate-200 mb-1">
                  Phone Number <span className="text-charcoal-muted dark:text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
                  <input
                    type="tel"
                    name="contactInfo"
                    value={form.contactInfo}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-center text-xs text-charcoal-muted dark:text-slate-400">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
