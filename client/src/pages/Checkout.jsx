// ============================================================
// src/pages/Checkout.jsx
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, totalPrice, totalItems, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shipping_address: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/orders', form);
      await fetchCart(); // Refresh (should be empty now)
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <HiOutlineCheckCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <p className="text-muted text-lg mb-6">Your cart is empty</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
          <div className="block-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground">Shipping Details</h2>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-muted mb-1.5">Shipping Address</label>
              <textarea
                id="address"
                rows={3}
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                placeholder="Building, Street, City, State, PIN Code"
                required
                className="input resize-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-muted mb-1.5">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-lg">
            {loading ? 'Placing Order...' : `Place Order · ${formatPrice(totalPrice)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="block-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted line-clamp-1 flex-1 pr-4">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-foreground font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-borderline/50 mt-4 pt-4">
              <div className="flex justify-between text-muted text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted text-sm mt-2">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-lg mt-3 pt-3 border-t border-borderline/50">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
