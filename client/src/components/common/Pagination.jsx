// ============================================================
// src/components/common/Pagination.jsx
// ============================================================

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalCount } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-dark-400 text-sm">
        Showing page {currentPage} of {totalPages} ({totalCount} items)
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
