import { Link, useLocation, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, UtensilsCrossed, ClipboardList, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Toast from '../components/common/Toast';

export default function CustomerLayout() {
  const { cartCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-charcoal text-lg leading-none">SRKR</span>
                <span className="block text-[10px] font-medium text-charcoal-muted leading-none mt-0.5 tracking-wide">CAFETERIA</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-gray-50'
                    }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Cart & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive('/cart')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-gray-50'
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

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-gray-50'
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Toast Notifications */}
      <Toast />

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-charcoal text-sm">SRKR Cafeteria</span>
                <span className="block text-[10px] text-charcoal-muted">Smart Food Ordering System</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-charcoal-muted">
              <Link to="/menu" className="hover:text-brand-600 transition-colors">Menu</Link>
              <Link to="/orders" className="hover:text-brand-600 transition-colors">Orders</Link>
              <Link to="/admin/login" className="hover:text-brand-600 transition-colors">Admin</Link>
            </div>
            <p className="text-xs text-charcoal-muted/60">
              © {new Date().getFullYear()} SRKR Engineering College Cafeteria
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
