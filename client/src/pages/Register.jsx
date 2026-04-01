// ============================================================
// src/pages/Register.jsx
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiBolt, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to FlashMart!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <HiBolt className="w-10 h-10 text-accent-500" />
            <span className="text-2xl font-bold gradient-text">FlashMart</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-dark-400 mt-1">Join FlashMart for exclusive flash deals</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-slide-up">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="input !pl-12" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input !pl-12" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} className="input !pl-12" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-dark-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
