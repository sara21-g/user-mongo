export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button
        id="pagination-prev"
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            id={`pagination-page-${p}`}
            className={`page-btn${page === p ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        id="pagination-next"
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}
