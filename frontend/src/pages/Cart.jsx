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
import FoodImage from '../components/common/FoodImage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/currency';
import { ORDER_TYPES } from '../services/orderService';

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createNewOrder } = useOrders();
  const { menu } = useMenu();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    studentId: '',
    contactInfo: '',
    orderType: ORDER_TYPES.DINE_IN,
  });
  const [errors, setErrors] = useState({});
  const [showReview, setShowReview] = useState(false);

  // Check if any cart items have become unavailable
  const unavailableItems = cart.filter((cartItem) => {
    const menuItem = menu.find((m) => m.id === cartItem.id);
    return !menuItem || !menuItem.available;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!form.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = () => {
    if (!validateForm()) return;
    setShowReview(true);
  };

  const handlePlaceOrder = () => {
    // Remove unavailable items from cart before placing order
    const validItems = cart.filter((cartItem) => {
      const menuItem = menu.find((m) => m.id === cartItem.id);
      return menuItem && menuItem.available;
    });

    if (validItems.length === 0) return;

    const newOrder = createNewOrder({
      customerName: form.customerName.trim(),
      studentId: form.studentId.trim(),
      contactInfo: form.contactInfo.trim(),
      orderType: form.orderType,
      items: validItems,
    });

    if (newOrder) {
      clearCart();
      navigate(`/orders/${newOrder.id}`, { state: { justPlaced: true } });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal">Your Cart is Empty</h2>
        <p className="mt-2 text-charcoal-muted">Add some delicious items from our menu to get started.</p>
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
          <h1 className="font-display text-3xl font-bold text-charcoal">Your Cart</h1>
          <p className="mt-1 text-charcoal-muted">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Cart</span>
        </button>
      </div>

      {/* Unavailable Items Warning */}
      {unavailableItems.length > 0 && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {unavailableItems.length} item{unavailableItems.length !== 1 ? 's are' : ' is'} no longer available
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {unavailableItems.map((i) => i.name).join(', ')} — will be removed during checkout.
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
                className={`flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 ${isUnavailable ? 'opacity-60 border-amber-200 bg-amber-50/50' : ''}`}
              >
                <FoodImage src={menuItem?.image || item.image} alt={item.name} className="w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-charcoal text-sm">{item.name}</h3>
                      <p className="text-sm text-charcoal-muted mt-0.5">{formatCurrency(item.price)} each</p>
                      {isUnavailable && (
                        <span className="text-xs text-amber-600 font-medium">Unavailable</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-charcoal-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-charcoal">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-charcoal-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-display font-bold text-charcoal">
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
          <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display font-bold text-lg text-charcoal mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-muted truncate mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-charcoal font-medium shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-charcoal">Total</span>
                <span className="font-display font-bold text-xl text-brand-600">
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
                <h4 className="font-semibold text-charcoal text-sm">Confirm Your Order</h4>
                <div className="text-sm space-y-1.5 bg-gray-50 rounded-xl p-3">
                  <p><span className="text-charcoal-muted">Name:</span> <span className="font-medium">{form.customerName}</span></p>
                  {form.studentId && <p><span className="text-charcoal-muted">Student ID:</span> <span className="font-medium">{form.studentId}</span></p>}
                  {form.contactInfo && <p><span className="text-charcoal-muted">Contact:</span> <span className="font-medium">{form.contactInfo}</span></p>}
                  <p><span className="text-charcoal-muted">Serving:</span> <span className="font-medium">{form.orderType}</span></p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>Pay at Counter</strong> — This is a demo. No payment is processed online. Pay when you collect your food.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReview(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-charcoal-muted font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setErrors({}); }}
                    placeholder="Enter your name"
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 ${
                      errors.customerName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    Student ID <span className="text-charcoal-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    placeholder="e.g., 22B01A05XX"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Contact <span className="text-charcoal-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                </div>

                <fieldset>
                  <legend className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-1.5">
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
                              ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15'
                              : 'border-gray-200 hover:border-brand-200'
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
                            <Icon className={`w-4 h-4 ${selected ? 'text-brand-600' : 'text-charcoal-muted'}`} />
                            <span className="text-sm font-semibold text-charcoal">{label}</span>
                          </span>
                          <span className="block text-[11px] text-charcoal-muted mt-1">{description}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-charcoal-muted font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
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
