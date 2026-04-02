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
          className="p-2 rounded-none text-foreground hover:bg-foreground hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-display uppercase tracking-widest text-xs font-bold border-2 border-transparent hover:border-foreground"
        >
          <HiChevronLeft className="w-5 h-5 mx-auto" />
        </button>

        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`w-10 h-10 flex items-center justify-center font-display font-black text-sm transition-all border-2 border-transparent hover:border-foreground
                ${currentPage === i + 1 
                ? 'bg-foreground text-surface' 
                : 'text-foreground hover:bg-foreground/5'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-none text-foreground hover:bg-foreground hover:text-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-display uppercase tracking-widest text-xs font-bold border-2 border-transparent hover:border-foreground"
        >
          <HiChevronRight className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
