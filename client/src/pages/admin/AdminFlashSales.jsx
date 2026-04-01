// ============================================================
// src/pages/admin/AdminFlashSales.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiOutlineTrash, HiBolt } from 'react-icons/hi2';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminFlashSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const res = await api.get('/flash-sales');
      setSales(res.data.data.sales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this flash sale?')) return;
    try {
      await api.delete(`/flash-sales/${id}`);
      toast.success('Flash sale deleted.');
      fetchSales();
    } catch {
      toast.error('Failed to delete flash sale.');
    }
  };

  const getSaleStatus = (sale) => {
    const now = new Date();
    const start = new Date(sale.start_time);
    const end = new Date(sale.end_time);

    if (!sale.is_active) return { label: 'Inactive', color: 'badge-danger' };
    if (now < start) return { label: 'Upcoming', color: 'badge-primary' };
    if (now > end) return { label: 'Ended', color: 'badge-danger' };
    return { label: 'Live', color: 'badge-accent' };
  };

  if (loading) return <LoadingSpinner text="Loading flash sales..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HiBolt className="text-accent-500" /> Flash Sales
          </h1>
          <p className="text-dark-400">{sales.length} sales</p>
        </div>
        <Link to="/admin/flash-sales/new" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Create Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <HiBolt className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-300 text-lg">No flash sales yet</p>
          <p className="text-dark-500 text-sm mt-1">Create one to drive traffic!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => {
            const status = getSaleStatus(sale);
            return (
              <div key={sale.id} className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{sale.title}</h3>
                      <span className={status.color}>{status.label}</span>
                    </div>
                    <p className="text-dark-400 text-sm">
                      {formatDateTime(sale.start_time)} — {formatDateTime(sale.end_time)}
                    </p>
                    <p className="text-dark-500 text-sm mt-1">
                      {sale.item_count || 0} products · {sale.total_sold || 0} sold
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors self-start"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminFlashSales;
