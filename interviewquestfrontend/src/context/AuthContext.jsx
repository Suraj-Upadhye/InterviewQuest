import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session state from local storage on launch
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await API.post('/api/auth/login', { usernameOrEmail, password });
      const { token, id, username, email, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, username, email, role }));

      setToken(token);
      setUser({ id, username, email, role });
      return { id, username, email, role };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const register = async (username, email, password, role) => {
    try {
      const response = await API.post('/api/auth/register', { username, email, password, role });
      return response.data.message;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const isAdmin = useMemo(() => {
    if (!token) return false;
    const payload = parseJwt(token);
    return payload?.role === 'ROLE_ADMIN';
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
