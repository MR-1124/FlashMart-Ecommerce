// ============================================================
// src/context/CartContext.jsx — Cart state management
// ============================================================
// Syncs cart with the backend API. Provides add, update,
// remove, clear operations and a cart count for the navbar.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      const { items, totalItems: total, totalPrice: price } = res.data.data;
      setCartItems(items);
      setTotalItems(total);
      setTotalPrice(price);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { product_id: productId, quantity });
    await fetchCart(); // Refresh cart
    return res.data;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCartItems([]);
    setTotalItems(0);
    setTotalPrice(0);
  };

  return (
    <CartContext.Provider value={{
      cartItems, totalItems, totalPrice, loading,
      addToCart, updateQuantity, removeItem, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export default CartContext;
