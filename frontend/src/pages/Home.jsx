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
  const heroItem = featuredItems[0] || menu.find((item) => item.available);
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
      <section className="relative overflow-hidden bg-[#fff8f1]">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-10 lg:gap-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-2 text-xs font-bold tracking-wide text-brand-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                OPEN NOW · SRKR ENGINEERING COLLEGE
              </div>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
                Your break.
                <span className="block text-brand-500">Your food.</span>
                <span className="block">Your token.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-charcoal-muted sm:text-lg">
                Skip the lunch queue. Order fresh cafeteria favourites from your classroom, get a live token, and collect when it is ready.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/menu" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:-translate-y-0.5 hover:bg-brand-600">
                  <UtensilsCrossed className="h-4 w-4" />
                  Start an order
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/orders" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-charcoal transition hover:border-brand-200 hover:text-brand-600">
                  <ClipboardList className="h-4 w-4" />
                  Track an order
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-charcoal-muted">
                <span><strong className="font-display text-xl text-charcoal">{menu.length}+</strong> menu items</span>
                <span className="hidden h-6 w-px bg-gray-300 sm:block" />
                <span><strong className="font-display text-xl text-charcoal">₹20</strong> from</span>
                <span className="hidden h-6 w-px bg-gray-300 sm:block" />
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><strong className="text-charcoal">4.8</strong> student rating</span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-brand-500/10 blur-2xl" />
              {heroItem && (
                <div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-white shadow-2xl shadow-brand-900/10">
                  <FoodImage src={heroItem.image} alt={heroItem.name} className="h-72 w-full sm:h-96" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-700 backdrop-blur">
                    Today’s pick
                  </div>
                  <div className="flex items-end justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{heroItem.category}</p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-charcoal">{heroItem.name}</h2>
                      <p className="mt-1 text-sm text-charcoal-muted">Freshly prepared · {heroItem.preparationTime} min</p>
                    </div>
                    <span className="font-display text-2xl font-bold text-brand-600">{formatCurrency(heroItem.price)}</span>
                  </div>
                </div>
              )}
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:left-[-1.5rem]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><PackageCheck className="h-5 w-5" /></div>
                <div><p className="text-xs font-bold text-charcoal">Token-based pickup</p><p className="text-[11px] text-charcoal-muted">No counter queue</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-gray-100 px-4 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {[
            { icon: UtensilsCrossed, title: 'Pick your favourites', desc: 'Browse the live menu' },
            { icon: ClipboardList, title: 'Get a smart token', desc: 'Review before you pay' },
            { icon: PackageCheck, title: 'Collect with ease', desc: 'Come when it is ready' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-4 py-3 sm:justify-center">
              <item.icon className="h-5 w-5 text-brand-500" />
              <div><p className="text-sm font-bold text-charcoal">{item.title}</p><p className="text-xs text-charcoal-muted">{item.desc}</p></div>
            </div>
          ))}
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
