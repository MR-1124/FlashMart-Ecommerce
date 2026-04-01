// ============================================================
// src/utils/formatters.js — Formatting utilities
// ============================================================

/** Format number as Indian Rupee currency */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/** Format date to readable string */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Format date with time */
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Calculate discount percentage */
export const calcDiscount = (original, sale) => {
  return Math.round(((original - sale) / original) * 100);
};

/** Truncate text */
export const truncate = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/** Order status color mapping */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    shipped: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return colors[status] || colors.pending;
};
