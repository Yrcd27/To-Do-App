import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setShowConfirm(false);
  };

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">Taskflow</span>
        {user && (
          <div className="navbar-right">
            <div className="navbar-avatar">{initials}</div>
            <span className="navbar-user">{user.name}</span>
            <button className="btn-logout" onClick={() => setShowConfirm(true)}>
              Sign out
            </button>
          </div>
        )}
      </nav>

      {showConfirm && (
        <ConfirmModal
          title="Sign out?"
          message="You'll need to log in again to access your tasks."
          confirmLabel="Sign out"
          danger
          loading={loggingOut}
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
