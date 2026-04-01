// ============================================================
// src/pages/Home.jsx — Landing page
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBolt, HiArrowRight, HiShieldCheck, HiTruck, HiCreditCard } from 'react-icons/hi2';
import api from '../api/axios';
import FlashSaleBanner from '../components/flash-sale/FlashSaleBanner';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?sort=popularity&limit=8');
        setFeatured(res.data.data.products);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/50 via-dark-950 to-dark-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <HiBolt className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-primary-300 font-medium">Auto-Scaling Flash Sales Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
              Deals That Move
              <span className="gradient-text"> Fast.</span>
              <br />
              Servers That
              <span className="gradient-text"> Scale.</span>
            </h1>

            <p className="text-lg text-dark-300 mb-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Experience flash sales backed by AWS auto-scaling infrastructure.
              Lightning deals, real-time countdowns, and seamless performance under any traffic spike.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/products" className="btn-primary !text-base !py-4 !px-8 flex items-center justify-center gap-2">
                Shop Now <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary !text-base !py-4 !px-8">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Flash Sale Banner ─── */}
      <FlashSaleBanner />

      {/* ─── Features Strip ─── */}
      <section className="border-y border-dark-800 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: HiTruck, title: 'Fast Delivery', desc: 'Free shipping on orders above ₹999' },
              { icon: HiShieldCheck, title: 'Secure Payments', desc: 'Your data is always protected' },
              { icon: HiCreditCard, title: 'Easy Returns', desc: '7-day hassle-free returns' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-xs text-dark-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Products</h2>
            <p className="text-dark-400 mt-1">Trending items people love</p>
          </div>
          <Link to="/products" className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2">
            View All <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
