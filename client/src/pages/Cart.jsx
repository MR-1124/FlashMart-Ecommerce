// ============================================================
// src/pages/Cart.jsx
// ============================================================

import { Link } from 'react-router-dom';
import { HiMinus, HiPlus, HiOutlineTrash, HiArrowRight, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, totalItems, totalPrice, loading, updateQuantity, removeItem, clearCart } = useCart();

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart.');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
      toast.success('Item removed from cart.');
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared.');
    } catch {
      toast.error('Failed to clear cart.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading cart..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
      <p className="text-muted mb-8">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 block-card">
          <HiOutlineShoppingBag className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">Your cart is empty</p>
          <p className="text-muted text-sm mb-6">Add some products to get started!</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="block-card p-4 flex gap-4 items-center animate-fade-in">
                {/* Product Image */}
                <div className="w-20 h-20 bg-surface rounded-xl flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl opacity-30">📦</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="text-foreground font-semibold hover:text-primary-400 transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-muted text-sm">{item.category_name}</p>
                  <p className="text-foreground font-bold mt-1">{formatPrice(item.price)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-surface rounded-lg">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    className="p-2 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-foreground font-medium text-sm">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-2 text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right">
                  <p className="text-foreground font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 text-sm mt-1 transition-colors">
                    <HiOutlineTrash className="w-4 h-4 inline" />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleClear} className="text-sm text-muted hover:text-red-400 transition-colors">
              Clear entire cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="block-card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 border-b border-borderline/50 pb-4 mb-4">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
              </div>

              <div className="flex justify-between text-foreground font-bold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                Proceed to Checkout <HiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
