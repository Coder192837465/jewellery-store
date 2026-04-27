import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gyani_token'));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          logout();
        } else {
          localStorage.setItem('gyani_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(payload);
        }
      } catch (e) {
        console.error('Token parsing error:', e);
        logout();
      }
    } else {
      localStorage.removeItem('gyani_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  // Handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Only redirect if we thought we were logged in
          if (localStorage.getItem('gyani_token')) {
            console.warn('Session expired or unauthorized. Logging out.');
            logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    console.log('Sending login request to /api/auth/login');
    const response = await axios.post('/api/auth/login', { email, password });
    const newToken = response.data.token;
    
    // Set everything immediately to avoid race conditions
    localStorage.setItem('gyani_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    setToken(newToken);
    setUser(response.data.user);
    console.log('Login successful, token and user set.');
    return true;
  };

  const register = async (name, email, password) => {
    const response = await axios.post('/api/auth/register', { name, email, password });
    const newToken = response.data.token;
    
    localStorage.setItem('gyani_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    setToken(newToken);
    setUser(response.data.user);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('gyani_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
