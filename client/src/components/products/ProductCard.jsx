// ============================================================
// src/components/products/ProductCard.jsx
// ============================================================

import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiStar } from 'react-icons/hi2';
import { formatPrice, truncate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, salePrice = null }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      return;
    }

    try {
      await addToCart(product.id || product.product_id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart.');
    }
  };

  const displayPrice = salePrice || product.sale_price || product.price;
  const originalPrice = salePrice ? product.original_price || product.price : null;
  const discount = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const productId = product.id || product.product_id;

  return (
    <Link
      to={`/products/${productId}`}
      className="group glass-card overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/5"
    >
      {/* Image */}
      <div className="relative aspect-square bg-dark-800 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
          <span className="text-4xl opacity-30">📦</span>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}% OFF
          </div>
        )}

        {/* Low Stock Badge */}
        {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Only {product.stock} left!
          </div>
        )}

        {/* Add to Cart Overlay */}
        <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs text-primary-400 font-medium mb-1 uppercase tracking-wider">
            {product.category_name}
          </p>
        )}

        <h3 className="text-sm font-semibold text-dark-100 group-hover:text-white transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <HiStar className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-dark-400">
              {parseFloat(product.avg_rating).toFixed(1)} · {product.total_sold || 0} sold
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <span className="text-sm text-dark-500 line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
