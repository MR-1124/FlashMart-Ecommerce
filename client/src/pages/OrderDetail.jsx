// ============================================================
// src/pages/OrderDetail.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import api from '../api/axios';
import { formatPrice, formatDateTime, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order..." />;
  if (!order) return <div className="text-center py-20 text-dark-300">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
          <p className="text-dark-400">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={`badge border text-base ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-dark-700/50 last:border-0">
                  <div className="w-14 h-14 bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-lg opacity-30">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-dark-400 text-sm">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <p className="text-white font-bold">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-dark-300">
                <span>Subtotal</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-dark-300">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-dark-700/50">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3">Shipping</h3>
            <p className="text-dark-300 text-sm">{order.shipping_address}</p>
            <p className="text-dark-400 text-sm mt-2">📞 {order.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
