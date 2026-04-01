// ============================================================
// src/pages/ProductDetail.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiStar, HiMinus, HiPlus, HiArrowLeft } from 'react-icons/hi2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data.product);
      } catch {
        toast.error('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return <div className="text-center py-20 text-dark-300">Product not found</div>;

  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link to="/products" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="glass-card aspect-square flex items-center justify-center">
          <span className="text-8xl opacity-20">📦</span>
        </div>

        {/* Info */}
        <div className="animate-fade-in">
          {product.category_name && (
            <span className="badge-primary mb-3">{product.category_name}</span>
          )}

          <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className={`w-5 h-5 ${i < Math.round(product.avg_rating) ? 'text-amber-400' : 'text-dark-600'}`} />
                ))}
              </div>
              <span className="text-dark-400 text-sm">
                {parseFloat(product.avg_rating).toFixed(1)} · {product.total_sold} sold
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-extrabold text-white">{formatPrice(product.price)}</span>
          </div>

          {/* Description */}
          <p className="text-dark-300 leading-relaxed mb-8">{product.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            {inStock ? (
              <span className="badge-success">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="badge-danger">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center glass-card !rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                >
                  <HiMinus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 text-white font-semibold min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                >
                  <HiPlus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <HiOutlineShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
