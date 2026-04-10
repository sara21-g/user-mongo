import { useEffect, useRef } from 'react';

export default function Filters({ filters, onChange, onReset, totalUsers }) {
  const searchRef = useRef(null);

  // Debounced name search – update parent after brief pause
  let debounceTimer = null;
  const handleNameChange = (e) => {
    const val = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onChange({ name: val, page: 1 });
    }, 350);
    // Immediately update the input visually by keeping controlled state elsewhere
    e.target.setAttribute('data-value', val);
  };

  const handleChange = (field) => (e) => {
    onChange({ [field]: e.target.value, page: 1 });
  };

  return (
    <section className="filters-section">
      <div className="filters-card">
        <div className="filters-header">
          <span className="filters-title">
            🔍 Search & Filter
          </span>
          <button
            id="reset-filters-btn"
            className="btn btn-ghost btn-sm"
            onClick={onReset}
            title="Reset all filters"
          >
            ↺ Reset
          </button>
        </div>

        <div className="filters-grid">
          {/* Name Search */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-name">Search by Name</label>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                id="filter-name"
                ref={searchRef}
                type="text"
                className="form-input search-input"
                placeholder="Search users…"
                defaultValue={filters.name}
                onChange={handleNameChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-email">Email</label>
            <input
              id="filter-email"
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={filters.email}
              onChange={handleChange('email')}
            />
          </div>

          {/* Min Age */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-min-age">Min Age</label>
            <input
              id="filter-min-age"
              type="number"
              className="form-input"
              placeholder="0"
              min="0"
              max="120"
              value={filters.minAge}
              onChange={handleChange('minAge')}
            />
          </div>

          {/* Max Age */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-max-age">Max Age</label>
            <input
              id="filter-max-age"
              type="number"
              className="form-input"
              placeholder="120"
              min="0"
              max="120"
              value={filters.maxAge}
              onChange={handleChange('maxAge')}
            />
          </div>

          {/* Sort */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-sort">Sort By</label>
            <select
              id="filter-sort"
              className="form-select form-input"
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split('-');
                onChange({ sortBy, order, page: 1 });
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="age-asc">Age (Low–High)</option>
              <option value="age-desc">Age (High–Low)</option>
            </select>
          </div>
        </div>

        {/* Second row: Hobbies + Bio text search */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="filter-hobbies">Filter by Hobby</label>
            <input
              id="filter-hobbies"
              type="text"
              className="form-input"
              placeholder="e.g. hiking (comma-separated for multiple)"
              value={filters.hobbies}
              onChange={handleChange('hobbies')}
            />
            <span className="form-hint">Uses MongoDB Multikey Index</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="filter-search">Bio Text Search</label>
            <input
              id="filter-search"
              type="text"
              className="form-input"
              placeholder="e.g. mountain photography"
              value={filters.search}
              onChange={handleChange('search')}
            />
            <span className="form-hint">Uses MongoDB Text Index</span>
          </div>
        </div>
      </div>
    </section>
  );
}
