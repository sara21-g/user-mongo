import { useState, useEffect, useRef } from 'react';

const HOBBIES_SUGGESTIONS = [
  'Reading', 'Hiking', 'Photography', 'Gaming', 'Cooking',
  'Dancing', 'Yoga', 'Fishing', 'Gardening', 'Painting',
  'Music', 'Traveling', 'Cycling', 'Swimming', 'Writing'
];

const initialForm = {
  name: '',
  email: '',
  age: '',
  hobbies: [],
  bio: '',
};

export default function UserForm({ onClose, onSave, editUser }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || '',
        email: editUser.email || '',
        age: editUser.age !== undefined ? String(editUser.age) : '',
        hobbies: editUser.hobbies || [],
        bio: editUser.bio || '',
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [editUser]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Please enter a valid email address';

    if (form.age !== '') {
      const ageNum = Number(form.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120)
        errs.age = 'Age must be between 0 and 120';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
    if (e.key === 'Backspace' && !tagInput && form.hobbies.length > 0) {
      removeTag(form.hobbies.length - 1);
    }
  };

  const addTag = (tag) => {
    const cleaned = tag.replace(/,/g, '').trim();
    if (cleaned && !form.hobbies.includes(cleaned)) {
      setForm((prev) => ({ ...prev, hobbies: [...prev.hobbies, cleaned] }));
    }
    setTagInput('');
  };

  const removeTag = (index) => {
    setForm((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        hobbies: form.hobbies,
        bio: form.bio.trim(),
      };
      if (form.age !== '') payload.age = Number(form.age);

      await onSave(payload, editUser?._id);
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div className="modal-title" id="modal-title">
            <div className="modal-title-icon">{editUser ? '✏️' : '➕'}</div>
            {editUser ? 'Edit User' : 'Add New User'}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.global && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--error-bg)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)',
                fontSize: '0.875rem'
              }}>
                ⚠️ {errors.global}
              </div>
            )}

            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alice Johnson"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="alice@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label" htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                className="form-input"
                placeholder="e.g. 25"
                min="0"
                max="120"
                value={form.age}
                onChange={handleChange}
                style={{ maxWidth: '180px' }}
              />
              {errors.age && <span className="form-error">{errors.age}</span>}
              <span className="form-hint">Between 0 and 120</span>
            </div>

            {/* Hobbies */}
            <div className="form-group">
              <label className="form-label">Hobbies</label>
              <div
                className="tags-container"
                onClick={() => tagInputRef.current?.focus()}
              >
                {form.hobbies.map((h, i) => (
                  <span key={i} className="tag">
                    {h}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(i)}
                      aria-label={`Remove ${h}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  className="tag-input"
                  placeholder={form.hobbies.length === 0 ? "Type hobby & press Enter or comma…" : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {HOBBIES_SUGGESTIONS.filter(s => !form.hobbies.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addTag(s)}
                    style={{
                      padding: '2px 9px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="form-textarea"
                placeholder="A short description about this user (used for text search)…"
                value={form.bio}
                onChange={handleChange}
              />
              <span className="form-hint">This field is indexed for full-text search.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="save-user-btn">
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Saving…
                </>
              ) : editUser ? '✔ Save Changes' : '✚ Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
