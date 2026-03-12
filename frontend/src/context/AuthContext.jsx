import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Base API URL (adjust if deployed)
  const API_URL = 'http://localhost:5000/api/auth';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // 🔐 REGISTER
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, userData);


      const { token } = res.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token } = res.data;
      localStorage.setItem('token', token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        register,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
