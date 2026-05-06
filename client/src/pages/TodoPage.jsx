import { useState, useEffect } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import TodoItem from '../components/TodoItem';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await api.get('/todos');
        setTodos(data.data);
      } catch {
        setFetchError('Failed to load todos.');
      } finally {
        setLoadingTodos(false);
      }
    };
    fetchTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setAddError('Title is required.');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      const { data } = await api.post('/todos', { title, description });
      setTodos([data.data, ...todos]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add todo.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdated = (updated) => {
    setTodos(todos.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleDeleted = (id) => {
    setTodos(todos.filter((t) => t._id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = todos.filter((t) => !t.done).length;

  return (
    <>
      <Navbar />
      <main className="todo-page">
        <div className="todo-container">
          <div className="todo-stats">
            <span>{todos.length} total</span>
            <span>{activeCount} active</span>
            <span>{doneCount} done</span>
          </div>

          <form className="add-todo-form" onSubmit={handleAdd}>
            <div className="form-group">
              <label htmlFor="new-title">New Todo</label>
              <input
                id="new-title"
                type="text"
                className="input"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-desc">Description (optional)</label>
              <textarea
                id="new-desc"
                className="input textarea"
                placeholder="Add details..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {addError && <p className="form-error">{addError}</p>}
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add Todo'}
            </button>
          </form>

          <div className="filter-bar">
            {['all', 'active', 'done'].map((f) => (
              <button
                key={f}
                className={`btn btn-ghost${filter === f ? ' filter-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loadingTodos && <p className="loading-text">Loading todos...</p>}
          {fetchError && <p className="form-error">{fetchError}</p>}

          {!loadingTodos && filtered.length === 0 && (
            <div className="empty-state">
              <p>
                {filter === 'all'
                  ? 'No todos yet. Add one above!'
                  : `No ${filter} todos.`}
              </p>
            </div>
          )}

          <ul className="todo-list">
            {filtered.map((todo) => (
              <li key={todo._id}>
                <TodoItem
                  todo={todo}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
