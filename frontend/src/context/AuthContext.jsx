/* eslint-disable react-refresh/only-export-components */
/**
 * Auth Context — SRKR Cafeteria
 * 
 * Provides authentication state management backed by the backend JWT API.
 * 
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../services/storageService';
import { apiRequest, clearApiToken, getApiToken, setApiToken } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredAuth();
    const token = getApiToken();
    if (stored && stored.isAuthenticated && token) {
      return stored;
    }
    if (stored || token) {
      clearStoredAuth();
      clearApiToken();
    }
    return null;
  });

  const establishSession = useCallback(async (endpoint, email, password, requiredRole) => {
    try {
      const { token, user: apiUser } = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (apiUser.role !== requiredRole) return { success: false, error: 'Invalid email or password' };
      const session = {
        isAuthenticated: true,
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        studentId: apiUser.studentId,
        contactInfo: apiUser.contactInfo,
        loginTime: new Date().toISOString(),
      };
      setApiToken(token);
      setUser(session);
      setStoredAuth(session);
      return { success: true, role: apiUser.role };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const login = useCallback((email, password) => establishSession('/auth/login', email, password, 'customer'), [establishSession]);
  const loginAdmin = useCallback((email, password) => establishSession('/auth/admin/login', email, password, 'admin'), [establishSession]);

  const register = useCallback(async ({ name, email, password, studentId, contactInfo }) => {
    try {
      const { token, user: apiUser } = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, studentId, contactInfo }),
      });
      const session = {
        isAuthenticated: true,
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        studentId: apiUser.studentId,
        contactInfo: apiUser.contactInfo,
        loginTime: new Date().toISOString(),
      };
      setApiToken(token);
      setUser(session);
      setStoredAuth(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearApiToken();
    clearStoredAuth();
  }, []);

  const isAuthenticated = user?.isAuthenticated === true;
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  const value = {
    user,
    admin: isAdmin ? user : null,
    isAuthenticated,
    isAdmin,
    isCustomer,
    login,
    loginAdmin,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
