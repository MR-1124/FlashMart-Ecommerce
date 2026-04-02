// ============================================================
// src/pages/admin/AdminProducts.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import api from '../../api/axios';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=50');
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading products..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
          <p className="text-muted">{products.length} products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="block-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-borderline/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Sold</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-borderline/30 hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-foreground font-medium line-clamp-1">{p.name}</p>
                  </td>
                  <td className="px-6 py-4 text-muted text-sm">{p.category_name || '—'}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${p.stock <= 10 ? 'text-amber-400' : 'text-muted'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted text-sm">{p.total_sold}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="p-2 text-muted hover:text-primary-400 transition-colors">
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-muted hover:text-red-400 transition-colors">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
