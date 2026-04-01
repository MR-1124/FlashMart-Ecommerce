// ============================================================
// src/components/flash-sale/FlashSaleBanner.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBolt } from 'react-icons/hi2';
import api from '../../api/axios';
import CountdownTimer from './CountdownTimer';
import ProductCard from '../products/ProductCard';

const FlashSaleBanner = () => {
  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await api.get('/flash-sales/active');
        setSaleData(res.data.data);
      } catch {
        // No active sale
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, []);

  if (loading || !saleData) return null;

  const { sale, items, status } = saleData;

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-600/10 via-red-600/10 to-accent-600/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-500/30 rounded-full px-5 py-2 mb-4">
            <HiBolt className="w-5 h-5 text-accent-400 animate-pulse" />
            <span className="text-accent-300 font-bold text-sm uppercase tracking-wider">
              {status === 'upcoming' ? 'Coming Soon' : 'Flash Sale Live'}
            </span>
            <HiBolt className="w-5 h-5 text-accent-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {sale.title}
          </h2>
          {sale.description && (
            <p className="text-dark-300 max-w-lg mx-auto">{sale.description}</p>
          )}

          {/* Countdown */}
          <div className="mt-6">
            <CountdownTimer
              targetDate={sale.end_time}
              label={status === 'upcoming' ? 'Starts in' : 'Ends in'}
            />
          </div>
        </div>

        {/* Sale Products */}
        {items && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                salePrice={item.sale_price}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSaleBanner;
