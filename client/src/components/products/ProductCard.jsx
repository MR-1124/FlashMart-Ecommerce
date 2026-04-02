import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiStar } from 'react-icons/hi2';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product, salePrice = null }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      return;
    }

    try {
      await addToCart(product.id || product.product_id);
      toast.success('Added to collection!');
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
      className="group flex flex-col items-start"
    >
      {/* Image Block */}
      <div className="relative aspect-[4/5] w-full border-2 border-borderline bg-muted/5 overflow-hidden mb-4 transition-transform duration-500 group-hover:-translate-y-2">
        <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
          <span className="text-5xl opacity-20">📦</span>
        </div>

        {/* Badges */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-foreground text-surface font-display font-bold uppercase tracking-widest text-[10px] px-3 py-1">
            -{discount}% // SALE
          </div>
        )}

        {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
          <div className="absolute bottom-4 left-4 border bg-surface/90 border-foreground text-foreground font-display font-bold uppercase tracking-widest text-[10px] px-3 py-1">
            LAST {product.stock}
          </div>
        )}

        {/* Quick Add overlay */}
        <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button
            onClick={handleAddToCart}
            className="btn-primary !px-8 !py-3 tracking-widest text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl"
          >
            + Quick Add
          </button>
        </div>
      </div>

      {/* Info Block */}
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between items-start w-full">
          <div>
            {product.category_name && (
              <p className="font-display font-bold uppercase tracking-widest text-[10px] text-muted mb-1">
                {product.category_name}
              </p>
            )}
            <h3 className="font-sans font-medium text-foreground text-sm uppercase group-hover:underline underline-offset-4 decoration-1">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-3 mt-1">
          <span className="font-display font-bold text-foreground">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <span className="font-display text-muted line-through text-xs">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
