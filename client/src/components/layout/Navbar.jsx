import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineBars3, HiOutlineXMark, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { HiBolt } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b-2 border-borderline transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Editorial Style */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl font-display font-bold uppercase tracking-tighter text-foreground group-hover:text-accent-500 transition-colors">
              FlashMart //
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-display font-medium uppercase tracking-widest text-sm">
            <Link to="/products" className="text-foreground/80 hover:text-foreground hover:underline underline-offset-4 decoration-2 transition-all">
              Collection
            </Link>

            {isAdmin && (
              <Link to="/admin/products" className="text-foreground/80 hover:text-accent-500 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-foreground/80 hover:text-foreground transition-colors">
              {theme === 'dark' ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2 font-display font-medium uppercase tracking-widest text-sm">
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="w-6 h-6 bg-foreground text-surface text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-transparent hover:border-foreground/10 transition-colors bg-foreground/5"
                  >
                    <span className="font-display uppercase tracking-widest text-xs font-bold text-foreground">
                      {user?.name?.split(' ')[0]} ▾
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-surface border-2 border-borderline p-2 shadow-xl animate-fade-in origin-top">
                      <div className="px-4 py-3 border-b-2 border-borderline mb-2">
                        <p className="font-display font-bold text-foreground uppercase tracking-widest text-sm">{user?.name}</p>
                        <p className="text-xs text-muted font-sans mt-0.5">{user?.email}</p>
                        {isAdmin && <span className="inline-block badge-accent text-[10px] mt-2">Admin</span>}
                      </div>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-display uppercase tracking-widest text-foreground hover:bg-foreground hover:text-surface transition-colors">
                        My Orders
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to="/admin/products" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-display uppercase tracking-widest text-foreground hover:bg-foreground hover:text-surface transition-colors mt-1">
                            Manage Products
                          </Link>
                          <Link to="/admin/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-display uppercase tracking-widest text-foreground hover:bg-foreground hover:text-surface transition-colors mt-1">
                            Manage Orders
                          </Link>
                          <Link to="/admin/flash-sales" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-display uppercase tracking-widest text-foreground hover:bg-foreground hover:text-surface transition-colors mt-1">
                            Flash Sales
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-display uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-colors mt-2 border-t-2 border-borderline pt-3">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-display font-medium uppercase tracking-widest text-sm hover:underline underline-offset-4 decoration-2">Sign In</Link>
                <Link to="/register" className="btn-primary !px-5 !py-2 !text-sm">Join</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-foreground">
              {theme === 'dark' ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <HiOutlineXMark className="w-8 h-8" /> : <HiOutlineBars3 className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-4 pt-4 border-t-2 border-borderline font-display uppercase tracking-widest font-medium">
              <Link to="/products" onClick={() => setMobileOpen(false)} className="text-foreground hover:text-accent-500 transition-colors">
                Collection
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-foreground hover:text-accent-500 transition-colors flex items-center justify-between">
                    <span>Cart</span>
                    {totalItems > 0 && <span className="bg-foreground text-surface px-2 shadow-sm">{totalItems}</span>}
                  </Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-foreground hover:text-accent-500 transition-colors">
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/products" onClick={() => setMobileOpen(false)} className="text-foreground hover:text-accent-500 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-red-600 pt-4 border-t-2 border-borderline">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 pt-4 border-t-2 border-borderline">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Create Account</Link>
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
