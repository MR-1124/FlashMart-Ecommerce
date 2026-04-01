// ============================================================
// src/pages/admin/AdminFlashSaleForm.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiOutlineTrash } from 'react-icons/hi2';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminFlashSaleForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    items: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=50');
        setProducts(res.data.data.products);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: '', sale_price: '', sale_stock: '' }],
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error('Add at least one product to the flash sale.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        items: form.items.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          sale_price: parseFloat(item.sale_price),
          sale_stock: parseInt(item.sale_stock, 10),
        })),
      };

      await api.post('/flash-sales', payload);
      toast.success('Flash sale created!');
      navigate('/admin/flash-sales');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create flash sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin/flash-sales" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Back to flash sales
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Create Flash Sale</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-8 space-y-5">
          <h2 className="text-lg font-bold text-white">Sale Details</h2>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Sale Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input"
              placeholder="e.g. Mega Flash Sale 🔥"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="input resize-none"
              placeholder="Sale description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">End Time *</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Sale Items */}
        <div className="glass-card p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Sale Products</h2>
            <button type="button" onClick={addItem} className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1">
              <HiPlus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {form.items.length === 0 && (
            <p className="text-dark-500 text-sm text-center py-4">No products added yet. Click "Add Product" above.</p>
          )}

          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end bg-dark-800/50 p-4 rounded-xl">
              <div className="col-span-5">
                <label className="block text-xs text-dark-400 mb-1">Product</label>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                  required
                  className="input !py-2 text-sm"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-dark-400 mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.sale_price}
                  onChange={(e) => updateItem(i, 'sale_price', e.target.value)}
                  required
                  className="input !py-2 text-sm"
                  placeholder="599"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-dark-400 mb-1">Sale Stock</label>
                <input
                  type="number"
                  value={item.sale_stock}
                  onChange={(e) => updateItem(i, 'sale_stock', e.target.value)}
                  required
                  className="input !py-2 text-sm"
                  placeholder="20"
                />
              </div>
              <div className="col-span-1">
                <button type="button" onClick={() => removeItem(i)} className="p-2 text-dark-400 hover:text-red-400 transition-colors">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-4 text-lg">
          {loading ? 'Creating...' : 'Create Flash Sale'}
        </button>
      </form>
    </div>
  );
};

export default AdminFlashSaleForm;
