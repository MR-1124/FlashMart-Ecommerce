import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import api from '../api/axios';
import FlashSaleBanner from '../components/flash-sale/FlashSaleBanner';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InfiniteMarquee from '../components/common/InfiniteMarquee';

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
    <div className="bg-surface relative">
      
      {/* ─── Hero Section (Editorial Layout) ─── */}
      <section className="relative min-h-[85vh] flex flex-col justify-center border-b-2 border-borderline">
        
        {/* Sideways Editorial Accents */}
        <div className="hidden lg:flex absolute left-8 inset-y-0 items-center justify-center opacity-30 select-none">
          <p className="vertical-text font-display uppercase tracking-[0.3em] font-bold text-xs text-foreground rotate-180">
            VOL. 01 — THE ESSENTIALS ISSUE
          </p>
        </div>
        <div className="hidden lg:flex absolute right-8 inset-y-0 items-center justify-center opacity-30 select-none">
          <p className="vertical-text font-display uppercase tracking-[0.3em] font-bold text-xs text-foreground">
            CURATED FLASH SALES / ARCHIVE
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 w-full z-10 text-center animate-fade-up">
          
          <div className="mb-8 inline-block border-2 border-foreground px-6 py-2">
            <span className="font-display uppercase tracking-widest font-bold text-xs text-foreground">
              Feature Presentation
            </span>
          </div>

          <h1 className="font-display font-black text-7xl sm:text-[10rem] leading-none tracking-tighter uppercase text-foreground mb-6">
            Style <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgb(var(--color-foreground))' }}>Rules</span>
          </h1>

          <p className="font-sans text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 font-medium">
            A brutalist approach to modern commerce. <br/> 
            Curated collections meet high-fashion aesthetics.
          </p>

          <Link to="/products" className="btn-primary inline-flex items-center gap-3 text-lg !py-5 !px-10 group">
            Explore Collection 
            <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </section>

      {/* ─── Infinite Marquee ─── */}
      <InfiniteMarquee text="THE SUMMER FLASH SALE IS NOW LIVE  ✦ " speed={30} />

      {/* ─── Flash Sale Banner (Print Spread Style) ─── */}
      <div className="border-b-2 border-borderline bg-muted/5">
        <FlashSaleBanner />
      </div>

      {/* ─── Featured Products (Editorial Grid) ─── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 border-b-2 border-foreground pb-6">
          <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-foreground">
            The Essentials
          </h2>
          <Link to="/products" className="font-display font-bold uppercase tracking-widest text-sm text-foreground/70 hover:text-foreground transition-colors hidden sm:block hover:underline underline-offset-4 decoration-2">
            View Complete Archive (20) ↗
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching archive..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center sm:hidden">
          <Link to="/products" className="btn-secondary w-full">
            View Complete Archive ↗
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
