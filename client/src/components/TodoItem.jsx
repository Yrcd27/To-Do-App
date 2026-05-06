import { useState } from 'react';
import api from '../api/api';
import ConfirmModal from './ConfirmModal';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 4h9M6 4V3h3v1M5 4v7a1 1 0 001 1h3a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function TodoItem({ todo, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    try {
      const { data } = await api.patch(`/todos/${todo._id}/done`);
      onUpdated(data.data);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put(`/todos/${todo._id}`, { title: title.trim(), description });
      onUpdated(data.data);
      setEditing(false);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setError('');
    setEditing(false);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/todos/${todo._id}`);
      onDeleted(todo._id);
    } catch {
      setError('Failed to delete.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (editing) {
    return (
      <div className="todo-item">
        <div className="todo-item-edit">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
          />
          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
          />
          {error && <p className="form-error">{error}</p>}
          <div className="todo-edit-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
        <div className="todo-item-view">
          <label className="todo-check-label" aria-label={todo.done ? 'Mark as active' : 'Mark as done'}>
            <input
              type="checkbox"
              className="todo-checkbox-input"
              checked={todo.done}
              onChange={handleToggle}
            />
            <span className="todo-check-mark">
              {todo.done && <CheckIcon />}
            </span>
          </label>

          <div className="todo-content">
            <p className="todo-title">{todo.title}</p>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
          </div>

          <div className="todo-item-actions">
            <button
              className="todo-action-btn"
              onClick={() => setEditing(true)}
              aria-label="Edit task"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              className="todo-action-btn todo-action-btn--delete"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete task"
              title="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete task?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          danger
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
