import { useState } from 'react';
import api from '../api/api';

export default function TodoItem({ todo, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      const { data } = await api.put(`/todos/${todo._id}`, { title, description });
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

  const handleDelete = async () => {
    try {
      await api.delete(`/todos/${todo._id}`);
      onDeleted(todo._id);
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <div className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
      {editing ? (
        <div className="todo-item-edit">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="input textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          {error && <p className="form-error">{error}</p>}
          <div className="todo-item-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-item-view">
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={todo.done}
            onChange={handleToggle}
          />
          <div className="todo-content">
            <p className="todo-title">{todo.title}</p>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
          </div>
          <div className="todo-item-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
