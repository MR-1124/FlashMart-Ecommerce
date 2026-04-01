// ============================================================
// src/pages/admin/AdminOrders.jsx
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await api.get(`/orders/admin/all${params}`);
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated.');
      fetchOrders();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Orders</h1>
          <p className="text-dark-400">{orders.length} orders</p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input !w-auto !py-2"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-dark-700/30 hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">#{o.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{o.user_name}</p>
                    <p className="text-dark-500 text-xs">{o.user_email}</p>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{formatPrice(o.total_amount)}</td>
                  <td className="px-6 py-4 text-dark-300 text-sm">{formatDate(o.created_at)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`badge border cursor-pointer ${getStatusColor(o.status)} bg-transparent text-sm`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
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

export default AdminOrders;
