import { useState, useEffect, useRef } from 'react';
import api from '../api/api';

export default function AddTodoModal({ onClose, onAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const { data } = await api.post('/todos', { title: title.trim(), description });
      onAdded(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setAdding(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            <span className="modal-title-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            New Task
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="modal-title-input">What needs to be done?</label>
              <input
                id="modal-title-input"
                ref={titleRef}
                type="text"
                className="input"
                placeholder="e.g. Review pull request, Buy groceries..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-desc">Details (optional)</label>
              <textarea
                id="modal-desc"
                className="input textarea"
                placeholder="Add any extra context or notes..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={adding}>
                {adding ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
