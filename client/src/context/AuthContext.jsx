import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const { data: refreshData } = await api.post('/auth/refresh');
        setAccessToken(refreshData.accessToken);
        const { data: meData } = await api.get('/auth/me');
        setUser(meData.data);
      } catch {
        // no valid session
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    const handle = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
