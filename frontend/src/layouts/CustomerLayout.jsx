import { Link, useLocation, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, UtensilsCrossed, ClipboardList, Home, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Toast from '../components/common/Toast';
import CustomerAuthModal from '../components/common/CustomerAuthModal';
import ThemeToggle from '../components/common/ThemeToggle';

export default function CustomerLayout() {
  const { cartCount } = useCart();
  const { user, isCustomer, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] dark:bg-slate-950 text-charcoal dark:text-slate-100 transition-colors duration-200 overflow-x-clip">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-linear-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-charcoal dark:text-white text-lg leading-none">SRKR</span>
                <span className="block text-[10px] font-medium text-charcoal-muted dark:text-slate-400 leading-none mt-0.5 tracking-wide">CAFETERIA</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to)
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 font-semibold'
                      : 'text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Cart, Theme Toggle, Customer Auth & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive('/cart')
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 font-semibold'
                    : 'text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {user && isCustomer ? (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-medium text-charcoal dark:text-slate-200 border border-gray-100 dark:border-slate-700">
                    <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span className="truncate max-w-[120px]">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-charcoal-muted dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15 hover:bg-brand-100 dark:hover:bg-brand-500/25 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to)
                      ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400'
                      : 'text-charcoal-muted dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                {user && isCustomer ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs font-medium text-charcoal dark:text-slate-200 flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-500" />
                      {user.name}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-red-600 dark:text-red-400 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Student Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Toast Notifications */}
      <Toast />

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-linear-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-charcoal dark:text-white text-sm">SRKR Cafeteria</span>
                <span className="block text-[10px] text-charcoal-muted dark:text-slate-400">Smart Food Ordering System</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-charcoal-muted dark:text-slate-400">
              <Link to="/menu" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Menu</Link>
              <Link to="/orders" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Orders</Link>
              <Link to="/admin/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Admin</Link>
            </div>
            <p className="text-xs text-charcoal-muted/60 dark:text-slate-500">
              © {new Date().getFullYear()} SRKR Engineering College Cafeteria
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
