// ============================================================
// src/App.jsx — Main application with routing
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminFlashSales from './pages/admin/AdminFlashSales';
import AdminFlashSaleForm from './pages/admin/AdminFlashSaleForm';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
              },
            }}
          />

          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (logged-in users) */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/products/:id/edit" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/flash-sales" element={<ProtectedRoute adminOnly><AdminFlashSales /></ProtectedRoute>} />
              <Route path="/admin/flash-sales/new" element={<ProtectedRoute adminOnly><AdminFlashSaleForm /></ProtectedRoute>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
