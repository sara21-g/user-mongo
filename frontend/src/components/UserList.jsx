function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="user-card fade-in" id={`user-card-${user._id}`}>
      <div className="user-card-header">
        <div className="user-avatar">{getInitials(user.name)}</div>
        <div className="user-info">
          <div className="user-name" title={user.name}>{user.name}</div>
          <div className="user-email" title={user.email}>{user.email}</div>
        </div>
        {user.age !== undefined && user.age !== null && (
          <div className="user-age-badge">{user.age} yrs</div>
        )}
      </div>

      {user.bio && <p className="user-bio">{user.bio}</p>}

      {user.hobbies && user.hobbies.length > 0 && (
        <div className="user-hobbies">
          {user.hobbies.slice(0, 5).map((h, i) => (
            <span key={i} className="hobby-tag">{h}</span>
          ))}
          {user.hobbies.length > 5 && (
            <span className="hobby-tag" style={{ background: 'transparent', borderStyle: 'dashed' }}>
              +{user.hobbies.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="user-footer">
        <span className="user-date">
          🕐 {formatDate(user.createdAt)}
        </span>
        <div className="user-actions">
          <button
            id={`edit-user-${user._id}`}
            className="btn btn-secondary btn-sm btn-icon"
            onClick={() => onEdit(user)}
            title="Edit user"
            aria-label={`Edit ${user.name}`}
          >
            ✏️
          </button>
          <button
            id={`delete-user-${user._id}`}
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => onDelete(user)}
            title="Delete user"
            aria-label={`Delete ${user.name}`}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserList({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading users…</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <h3>No users found</h3>
        <p>Try adjusting your filters or add a new user to get started.</p>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
