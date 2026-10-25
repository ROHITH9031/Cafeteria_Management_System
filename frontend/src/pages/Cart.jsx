import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight, UtensilsCrossed,
  X, User, Hash, Phone, AlertCircle, CreditCard,
  ShoppingBag, Utensils,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import FoodImage from '../components/common/FoodImage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/currency';
import { ORDER_TYPES } from '../services/orderService';
import { apiRequest, authHeaders } from '../services/apiClient';

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createNewOrder } = useOrders();
  const { menu } = useMenu();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [form, setForm] = useState(() => ({
    customerName: user?.name || '',
    studentId: user?.studentId || '',
    contactInfo: user?.contactInfo || '',
    orderType: ORDER_TYPES.DINE_IN,
  }));
  const [errors, setErrors] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  // Check if any cart items have become unavailable
  const unavailableItems = cart.filter((cartItem) => {
    const menuItem = menu.find((m) => m.id === cartItem.id);
    return !menuItem || !menuItem.available || menuItem.stock < cartItem.quantity;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!form.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(form.contactInfo.trim().replace(/[\s-]/g, ''))) {
      newErrors.contactInfo = 'Enter a valid 10-digit Indian mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const refreshQuote = async () => {
    setQuoting(true);
    setSubmitError('');
    try {
      const result = await apiRequest('/orders/quote', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ items: cart.map(({ id, quantity }) => ({ id, quantity })) }),
      });
      setQuote(result);
      return true;
    } catch (error) {
      setQuote(null);
      const unavailable = error.details?.map((item) => `${item.name}: ${item.available} available, ${item.requested} requested`).join('; ');
      setSubmitError(unavailable ? `${error.message}. ${unavailable}` : error.message);
      return false;
    } finally {
      setQuoting(false);
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    setShowReview(true);
    await refreshQuote();
  };

  const handlePlaceOrder = async () => {
    // Remove unavailable items from cart before placing order
    if (!quote) {
      setSubmitError('Refresh the availability and price before placing this order.');
      return;
    }

    setPlacingOrder(true);
    setSubmitError('');
    try {
      const newOrder = await createNewOrder({
        customerName: form.customerName.trim(),
        studentId: form.studentId.trim(),
        contactInfo: form.contactInfo.trim(),
        orderType: form.orderType,
        items: quote.items.map(({ itemId, quantity }) => ({ id: itemId, quantity })),
      });
      if (!newOrder?.id) {
        throw new Error('The server did not return a saved order. Please try again.');
      }
      clearCart();
      navigate(`/orders/${newOrder.id}`, { state: { justPlaced: true } });
    } catch (error) {
      setSubmitError(error.message || 'Unable to place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-slate-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal dark:text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-charcoal-muted dark:text-slate-400">Add some delicious items from our menu to get started.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-500 text-white font-semibold rounded-2xl hover:bg-brand-600 transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal dark:text-white">Your Cart</h1>
          <p className="mt-1 text-charcoal-muted dark:text-slate-400">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Cart</span>
        </button>
      </div>

      {/* Unavailable Items Warning */}
      {unavailableItems.length > 0 && (
        <div className="mb-6 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {unavailableItems.length} item{unavailableItems.length !== 1 ? 's need' : ' needs'} attention
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {unavailableItems.map((i) => i.name).join(', ')} is unavailable or has less stock than your cart quantity. Adjust or remove it before checkout.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const menuItem = menu.find((m) => m.id === item.id);
            const isUnavailable = !menuItem || !menuItem.available;

            return (
              <div
                key={item.id}
                className={`flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 ${isUnavailable ? 'opacity-60 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
              >
                <FoodImage src={menuItem?.image || item.image} alt={item.name} className="w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-charcoal dark:text-white text-sm">{item.name}</h3>
                      <p className="text-sm text-charcoal-muted dark:text-slate-400 mt-0.5">{formatCurrency(item.price)} each</p>
                      {isUnavailable && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Unavailable</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-charcoal-muted dark:text-slate-300"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-charcoal dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-charcoal-muted dark:text-slate-300"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-display font-bold text-charcoal dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary / Checkout */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-charcoal dark:text-white mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-muted dark:text-slate-400 truncate mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-charcoal dark:text-slate-200 font-medium shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-charcoal dark:text-white">Total</span>
                <span className="font-display font-bold text-xl text-brand-600 dark:text-brand-400">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : showReview ? (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-semibold text-charcoal dark:text-white text-sm">Confirm Your Order</h4>
                <div className="text-sm space-y-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
                  <p><span className="text-charcoal-muted dark:text-slate-400">Name:</span> <span className="font-medium text-charcoal dark:text-white">{form.customerName}</span></p>
                  {form.studentId && <p><span className="text-charcoal-muted dark:text-slate-400">Student ID:</span> <span className="font-medium text-charcoal dark:text-white">{form.studentId}</span></p>}
                  <p><span className="text-charcoal-muted dark:text-slate-400">Contact:</span> <span className="font-medium text-charcoal dark:text-white">{form.contactInfo}</span></p>
                  <p><span className="text-charcoal-muted dark:text-slate-400">Serving:</span> <span className="font-medium text-charcoal dark:text-white">{form.orderType}</span></p>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 space-y-2">
                  <p className="text-xs font-semibold text-charcoal dark:text-white">Live price and availability</p>
                  {quote?.items.map((item) => <div key={item.itemId} className="flex justify-between gap-2 text-xs text-charcoal-muted dark:text-slate-300"><span>{item.name} × {item.quantity} · {item.stock} in stock</span><span>{formatCurrency(item.price * item.quantity)}</span></div>)}
                  <div className="flex justify-between border-t border-gray-100 dark:border-slate-700 pt-2 text-sm font-bold text-charcoal dark:text-white"><span>Final total</span><span>{formatCurrency(quote?.totalAmount || 0)}</span></div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Pay at Counter</strong> — This is a demo. No payment is processed online. Pay when you collect your food.
                  </p>
                </div>

                {submitError && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-400">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReview(false)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={quote ? handlePlaceOrder : refreshQuote}
                    disabled={placingOrder}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    {placingOrder ? 'Placing...' : quote && submitError ? 'Retry Order' : quote ? 'Place Order' : 'Check Stock & Price'}
                  </button>
                  {submitError && <button onClick={refreshQuote} disabled={quoting} className="w-full text-xs font-semibold text-brand-600 dark:text-brand-400 disabled:opacity-50">{quoting ? 'Refreshing…' : 'Check availability again'}</button>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setErrors({}); }}
                    placeholder="Enter your name"
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 ${
                      errors.customerName ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    Student ID <span className="text-charcoal-muted dark:text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    placeholder="e.g., 22B01A05XX"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Contact <span className="text-charcoal-muted dark:text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.contactInfo}
                    onChange={(e) => { setForm({ ...form, contactInfo: e.target.value }); setErrors((current) => ({ ...current, contactInfo: '' })); }}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                  {errors.contactInfo && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.contactInfo}</p>}
                </div>

                <fieldset>
                  <legend className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-slate-200 mb-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    How would you like your order?
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: ORDER_TYPES.DINE_IN, label: 'Dine-in', description: 'Enjoy it at the cafeteria', Icon: Utensils },
                      { value: ORDER_TYPES.PARCEL, label: 'Parcel', description: 'Pack it to take away', Icon: ShoppingBag },
                    ].map(({ value, label, description, Icon }) => {
                      const selected = form.orderType === value;
                      return (
                        <label
                          key={value}
                          className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                            selected
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 ring-2 ring-brand-500/15'
                              : 'border-gray-200 dark:border-slate-700 hover:border-brand-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="orderType"
                            value={value}
                            checked={selected}
                            onChange={(e) => setForm({ ...form, orderType: e.target.value })}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${selected ? 'text-brand-600 dark:text-brand-400' : 'text-charcoal-muted dark:text-slate-400'}`} />
                            <span className="text-sm font-semibold text-charcoal dark:text-white">{label}</span>
                          </span>
                          <span className="block text-[11px] text-charcoal-muted dark:text-slate-400 mt-1">{description}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmLabel="Clear Cart"
        variant="danger"
      />
    </div>
  );
}
