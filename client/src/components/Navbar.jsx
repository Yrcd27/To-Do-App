import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <span className="navbar-brand">Taskflow</span>
      {user && (
        <div className="navbar-right">
          <div className="navbar-avatar">{initials}</div>
          <span className="navbar-user">{user.name}</span>
          <button className="btn-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
