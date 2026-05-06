import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="navbar-brand">Todo App</span>
      {user && (
        <div className="navbar-right">
          <span className="navbar-user">Hi, {user.name}</span>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
