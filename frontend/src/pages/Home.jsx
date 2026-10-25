import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  ClipboardList,
  Zap,
  Clock,
  Star,
  ShieldCheck,
  Smartphone,
  ChefHat,
  PackageCheck,
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import FoodImage from '../components/common/FoodImage';
import { formatCurrency } from '../utils/currency';

export default function Home() {
  const { menu } = useMenu();

  const featuredItems = menu.filter((item) => item.featured && item.available).slice(0, 4);
  const categories = [
    { name: 'Tiffins', icon: '🥞', count: menu.filter((i) => i.category === 'Tiffins').length, color: 'from-amber-400 to-orange-500' },
    { name: 'Fast Food', icon: '🍜', count: menu.filter((i) => i.category === 'Fast Food').length, color: 'from-red-400 to-rose-500' },
    { name: 'Meals & Curry', icon: '🍛', count: menu.filter((i) => i.category === 'Meals & Curry').length, color: 'from-emerald-400 to-teal-500' },
    { name: 'Tea & Coffee', icon: '☕', count: menu.filter((i) => i.category === 'Tea & Coffee').length, color: 'from-amber-600 to-yellow-600' },
  ];

  const steps = [
    { icon: UtensilsCrossed, title: 'Choose Food', desc: 'Browse our menu and add items to your cart', number: '01' },
    { icon: ClipboardList, title: 'Get Token', desc: 'Place your order and receive a unique token number', number: '02' },
    { icon: PackageCheck, title: 'Collect Food', desc: 'Show your token at the counter when your order is ready', number: '03' },
  ];

  const benefits = [
    { icon: Clock, title: 'Save Time', desc: 'No more waiting in long queues during lunch break' },
    { icon: Smartphone, title: 'Order from Anywhere', desc: 'Place orders from your classroom or hostel' },
    { icon: Zap, title: 'Fast Updates', desc: 'Track your food preparation status in real-time' },
    { icon: ShieldCheck, title: 'Secure Tokens', desc: 'Unique tokens ensure smooth food collection' },
  ];

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_50%)]" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-6 tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              SRKR ENGINEERING COLLEGE
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal leading-tight">
              Skip the Queue,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-500">
                Order Smart
              </span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-charcoal-muted leading-relaxed max-w-lg">
              Order your favourite food online, get a unique token, and collect your meal without waiting in line. The smart way to eat at SRKR Cafeteria.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all text-sm"
              >
                <UtensilsCrossed className="w-4.5 h-4.5" />
                Order Food
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-charcoal font-semibold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              >
                <ClipboardList className="w-4.5 h-4.5" />
                Track My Order
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-10">
              <div>
                <p className="text-2xl font-bold text-charcoal font-display">{menu.length}+</p>
                <p className="text-xs text-charcoal-muted">Menu Items</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-charcoal font-display">₹10</p>
                <p className="text-xs text-charcoal-muted">Starting From</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <p className="text-2xl font-bold text-charcoal font-display">4.8</p>
                <p className="text-xs text-charcoal-muted ml-1">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Section ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">Browse by Category</h2>
          <p className="mt-2 text-charcoal-muted">Choose from our wide selection of freshly prepared dishes</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              to={`/menu?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 card-hover"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-display font-semibold text-charcoal">{cat.name}</h3>
              <p className="text-sm text-charcoal-muted mt-1">{cat.count} items</p>
              <ArrowRight className="w-4 h-4 text-charcoal-muted mt-3 group-hover:translate-x-1 group-hover:text-brand-500 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">How It Works</h2>
            <p className="mt-2 text-charcoal-muted">Three simple steps to skip the queue</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-200 to-transparent" />
                )}
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center mb-5 relative">
                  <step.icon className="w-8 h-8 text-brand-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg text-charcoal">{step.title}</h3>
                <p className="mt-2 text-sm text-charcoal-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Items ────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">Featured Items</h2>
              <p className="mt-1 text-charcoal-muted">Most loved dishes from our kitchen</p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredItems.map((item) => (
              <Link
                to="/menu"
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
              >
                <FoodImage src={item.image} alt={item.name} className="h-40 w-full" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    {item.popular && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-charcoal group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1 line-clamp-2">{item.description}</p>
                  <p className="mt-3 font-display font-bold text-lg text-brand-600">{formatCurrency(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View Full Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Benefits ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-charcoal to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Why Use Smart Ordering?</h2>
            <p className="mt-2 text-white/60">No more long queues during lunch break</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-lg">{b.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="relative">
            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Ready to Order?</h2>
            <p className="mt-3 text-white/80 max-w-md mx-auto">
              Browse our menu, add items to your cart, and get your food ready without waiting in line.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-brand-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              <UtensilsCrossed className="w-4.5 h-4.5" />
              Browse Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
