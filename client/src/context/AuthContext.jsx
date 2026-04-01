// ============================================================
// src/context/AuthContext.jsx — Authentication state management
// ============================================================
// Provides user, token, login, register, logout throughout
// the app. Persists auth state in localStorage.
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('flashmart_token'));
  const [loading, setLoading] = useState(true);

  // On mount, validate the stored token
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch {
          // Token invalid — clear it
          localStorage.removeItem('flashmart_token');
          localStorage.removeItem('flashmart_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('flashmart_token', newToken);
    localStorage.setItem('flashmart_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('flashmart_token', newToken);
    localStorage.setItem('flashmart_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('flashmart_token');
    localStorage.removeItem('flashmart_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isAuthenticated,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
