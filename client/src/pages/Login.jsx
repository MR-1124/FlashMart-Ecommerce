// ============================================================
// src/pages/Login.jsx
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiBolt, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <HiBolt className="w-10 h-10 text-accent-500" />
            <span className="text-2xl font-bold gradient-text">FlashMart</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-dark-400 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-slide-up">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input !pl-12"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input !pl-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo Credentials */}
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">Demo Credentials</p>
            <button
              type="button"
              onClick={() => { setEmail('admin@flashmart.com'); setPassword('Admin@123'); }}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              👩‍💼 Admin: admin@flashmart.com
            </button>
            <br />
            <button
              type="button"
              onClick={() => { setEmail('user@flashmart.com'); setPassword('User@123'); }}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              👤 User: user@flashmart.com
            </button>
          </div>
        </form>

        <p className="text-center text-dark-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
