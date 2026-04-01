// ============================================================
// src/components/common/LoadingSpinner.jsx
// ============================================================

const LoadingSpinner = ({ size = 'lg', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className={`${sizes[size]} border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
