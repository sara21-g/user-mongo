import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import Filters from './components/Filters';
import Pagination from './components/Pagination';

const API = '/api/users';

const defaultFilters = {
  name: '',
  email: '',
  minAge: '',
  maxAge: '',
  hobbies: '',
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 9,
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const res = await axios.get(API, { params: cleanParams });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Create or Update user
  const handleSaveUser = async (payload, id) => {
    try {
      if (id) {
        await axios.put(`${API}/${id}`, payload);
        toast.success('✅ User updated successfully!');
      } else {
        await axios.post(API, payload);
        toast.success('🎉 User added successfully!');
      }
      setShowForm(false);
      setEditUser(null);
      fetchUsers(filters);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Operation failed');
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditUser(user);
    setShowForm(true);
  };

  // Open delete confirm
  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/${deleteTarget._id}`);
      toast.success('🗑️ User deleted successfully');
      setDeleteTarget(null);
      fetchUsers(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalUsers = pagination?.total ?? users.length;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#4c1d95',
            border: '1.5px solid #ddd6fe',
            borderRadius: '14px',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
          },
          success: {
            iconTheme: { primary: '#8b5cf6', secondary: '#ede9fe' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#ffe4e6' },
          },
        }}
      />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="navbar-logo-icon">👥</div>
            <span className="navbar-logo-text">
              User<span>Hub</span>
            </span>
          </div>
          <div className="navbar-stats">
            <div className="stat-badge">
              Total Users: <strong className="stat-badge-count">{totalUsers}</strong>
            </div>
            <button
              id="open-add-user-btn"
              className="btn btn-primary"
              onClick={() => { setEditUser(null); setShowForm(true); }}
            >
              ✚ Add User
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-tag">🚀 MongoDB + Node.js + React</div>
        <h1 className="hero-title">
          Manage Your <span className="hero-title-gradient">Users</span>
          <br />Effortlessly
        </h1>
        <p className="hero-subtitle">
          A full-stack User Management System with CRUD operations, advanced
          filtering, sorting, pagination, and MongoDB indexing.
        </p>
      </section>

      {/* ── Filters ── */}
      <Filters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalUsers={totalUsers}
      />

      {/* ── Users Section ── */}
      <main className="users-section">
        <div className="users-header">
          <div className="users-count">
            Showing <strong>{users.length}</strong> of <strong>{totalUsers}</strong> users
          </div>
          {pagination && pagination.totalPages > 1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        <UserList
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        <Pagination
          pagination={pagination}
          onPageChange={(p) => handleFilterChange({ page: p })}
        />
      </main>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <UserForm
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSave={handleSaveUser}
          editUser={editUser}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal confirm-modal">
            <div className="modal-body" style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div className="confirm-icon">⚠️</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
                Delete User?
              </h2>
              <p className="confirm-text">
                Are you sure you want to permanently delete{' '}
                <span className="confirm-user-name">"{deleteTarget.name}"</span>?
                <br />This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px', paddingTop: 0 }}>
              <button
                id="cancel-delete-btn"
                className="btn btn-ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger btn-lg"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Deleting…
                  </>
                ) : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
