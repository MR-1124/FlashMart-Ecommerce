// ============================================================
// src/pages/OrderHistory.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders?page=${page}`);
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
      <p className="text-muted mb-8">Track and view your order history</p>

      {orders.length === 0 ? (
        <div className="text-center py-20 block-card">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-muted text-lg mb-2">No orders yet</p>
          <p className="text-muted text-sm mb-6">Start shopping to see your orders here!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block-card p-5 block hover:border-primary-500/30 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-foreground font-semibold">Order #{order.id}</p>
                    <p className="text-muted text-sm">{formatDate(order.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`badge border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-foreground font-bold">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default OrderHistory;
