import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pb_token');
    const savedUser = localStorage.getItem('pb_user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('pb_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          _clearAuth();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const _clearAuth = () => {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    setUser(null);
  };

  const login = (token, userData) => {
    localStorage.setItem('pb_token', token);
    localStorage.setItem('pb_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    _clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
