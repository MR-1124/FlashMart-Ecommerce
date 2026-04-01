// ============================================================
// src/components/products/SearchBar.jsx
// ============================================================

import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';

const SearchBar = ({ categories, onSearch, onFilter, onSort, currentFilters }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={currentFilters.search || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="input !pl-12"
            id="product-search"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary !px-4 flex items-center gap-2 ${showFilters ? '!border-primary-500 !text-primary-400' : ''}`}
        >
          <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs text-dark-400 font-medium mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={currentFilters.category || ''}
                onChange={(e) => onFilter('category', e.target.value)}
                className="input !py-2.5 text-sm"
                id="filter-category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs text-dark-400 font-medium mb-1.5 uppercase tracking-wider">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={currentFilters.minPrice || ''}
                  onChange={(e) => onFilter('minPrice', e.target.value)}
                  className="input !py-2.5 text-sm"
                  id="filter-min-price"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={currentFilters.maxPrice || ''}
                  onChange={(e) => onFilter('maxPrice', e.target.value)}
                  className="input !py-2.5 text-sm"
                  id="filter-max-price"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs text-dark-400 font-medium mb-1.5 uppercase tracking-wider">Sort By</label>
              <select
                value={currentFilters.sort || ''}
                onChange={(e) => onSort(e.target.value)}
                className="input !py-2.5 text-sm"
                id="filter-sort"
              >
                <option value="">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
