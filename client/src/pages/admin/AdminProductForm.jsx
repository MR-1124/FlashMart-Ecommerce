// ============================================================
// src/pages/admin/AdminProductForm.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category_id: '', image_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data.data.categories);

        if (isEditing) {
          const prodRes = await api.get(`/products/${id}`);
          const p = prodRes.data.data.product;
          setForm({
            name: p.name, description: p.description || '', price: p.price,
            stock: p.stock, category_id: p.category_id || '', image_url: p.image_url || '',
          });
        }
      } catch {
        toast.error('Failed to load data.');
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="block-card p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Product Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="e.g. Wireless Earbuds Pro" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input resize-none" placeholder="Product description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Price (₹) *</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="input" placeholder="999" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Stock *</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} required className="input" placeholder="100" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="input" placeholder="/images/product.jpg" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
