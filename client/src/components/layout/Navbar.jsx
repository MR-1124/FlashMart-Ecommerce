// ============================================================
// src/components/layout/Navbar.jsx
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { HiBolt } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <HiBolt className="w-8 h-8 text-accent-500 group-hover:text-accent-400 transition-colors" />
            <span className="text-xl font-bold gradient-text">FlashMart</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-dark-300 hover:text-white transition-colors font-medium">
              Products
            </Link>

            {isAdmin && (
              <Link to="/admin/products" className="text-dark-300 hover:text-white transition-colors font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-dark-300 hover:text-white transition-colors">
                  <HiOutlineShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 text-dark-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-slide-down">
                      <div className="px-3 py-2 border-b border-dark-700/50 mb-1">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-dark-400">{user?.email}</p>
                        {isAdmin && <span className="badge-accent text-[10px] mt-1">Admin</span>}
                      </div>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
                        My Orders
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to="/admin/products" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
                            Manage Products
                          </Link>
                          <Link to="/admin/orders" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
                            Manage Orders
                          </Link>
                          <Link to="/admin/flash-sales" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
                            Flash Sales
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700/50 rounded-lg transition-colors mt-1">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-dark-300">
            {mobileOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-2 pt-2 border-t border-dark-700/50">
              <Link to="/products" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-dark-300 hover:text-white rounded-lg transition-colors">
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-dark-300 hover:text-white rounded-lg transition-colors flex items-center gap-2">
                    Cart {totalItems > 0 && <span className="badge-accent">{totalItems}</span>}
                  </Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-dark-300 hover:text-white rounded-lg transition-colors">
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/products" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-dark-300 hover:text-white rounded-lg transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left px-3 py-2 text-red-400 hover:text-red-300 rounded-lg transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary !py-2 text-sm flex-1 text-center">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary !py-2 text-sm flex-1 text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
