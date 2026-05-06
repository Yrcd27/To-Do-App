import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodoPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await api.get('/todos');
        setTodos(data.data);
      } catch {
        setFetchError('Failed to load tasks.');
      } finally {
        setLoadingTodos(false);
      }
    };
    fetchTodos();
  }, []);

  const handleAdded = (newTodo) => {
    setTodos([newTodo, ...todos]);
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
  const progress = todos.length === 0 ? 0 : Math.round((doneCount / todos.length) * 100);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      <Navbar />

      <main className="todo-page">
        <div className="todo-container">

          {/* Dashboard header */}
          <div className="dashboard-header">
            <p className="dashboard-greeting">{getGreeting()}</p>
            <h1 className="dashboard-title">{firstName}&apos;s Tasks</h1>

            <div className="stat-pills">
              <span className="stat-pill stat-pill--total">
                <span className="stat-pill-dot" />
                {todos.length} total
              </span>
              <span className="stat-pill stat-pill--active">
                <span className="stat-pill-dot" />
                {activeCount} active
              </span>
              <span className="stat-pill stat-pill--done">
                <span className="stat-pill-dot" />
                {doneCount} done
              </span>
            </div>

            <div className="progress-track" title={`${progress}% complete`}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-bar">
            {['all', 'active', 'done'].map((f) => (
              <button
                key={f}
                className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* States */}
          {loadingTodos && <p className="loading-text">Loading your tasks…</p>}
          {fetchError && <p className="form-error">{fetchError}</p>}

          {!loadingTodos && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                {filter === 'done' ? '✓' : '○'}
              </div>
              <p className="empty-state-text">
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </p>
              <p className="empty-state-sub">
                {filter === 'all'
                  ? 'Hit the + button below to add your first task'
                  : `Switch to "All" to see everything`}
              </p>
            </div>
          )}

          {/* Todo list */}
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

      {/* FAB */}
      <button
        className={`fab${modalOpen ? ' fab--open' : ''}`}
        onClick={() => setModalOpen(true)}
        aria-label="Add new task"
        title="New task"
      >
        +
      </button>

      {/* Modal */}
      {modalOpen && (
        <AddTodoModal
          onClose={() => setModalOpen(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  );
}
