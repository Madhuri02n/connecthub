import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('connecthub_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('connecthub_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formValues) => {
    const data = await authService.register(formValues);
    localStorage.setItem('connecthub_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // proceed with local logout regardless of server response
    }
    localStorage.removeItem('connecthub_token');
    setUser(null);
    toast.success('Logged out');
  };

  const updateLocalUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
