import { useState, useEffect } from 'react';
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
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row border-x-2 border-borderline">
          
          {/* Left Spread: The Editorial Headline */}
          <div className="w-full lg:w-1/3 p-8 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-borderline flex flex-col justify-between bg-foreground text-surface">
            <div>
              <div className="inline-block border border-surface px-4 py-1 mb-6">
                <span className="font-display font-bold uppercase tracking-widest text-xs">
                  {status === 'upcoming' ? 'Coming Soon' : 'Live Event'}
                </span>
              </div>
              <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tighter leading-none mb-6">
                {sale.title}
              </h2>
              {sale.description && (
                <p className="font-sans text-surface/80 max-w-sm font-medium mb-12">
                  {sale.description}
                </p>
              )}
            </div>

            <div className="mt-auto">
              <CountdownTimer
                targetDate={sale.end_time}
                label={status === 'upcoming' ? 'Kicks Off' : 'Concluding'}
              />
            </div>
          </div>

          {/* Right Spread: The Product Highlights */}
          <div className="w-full lg:w-2/3 p-4 lg:p-12">
            {items && items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                {items.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    salePrice={item.sale_price}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="font-display font-bold uppercase tracking-widest text-muted">Curating pieces...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
