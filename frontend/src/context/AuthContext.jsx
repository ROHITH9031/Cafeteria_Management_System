/* eslint-disable react-refresh/only-export-components */
/**
 * Auth Context — SRKR Cafeteria
 * 
 * ⚠ DEMO-ONLY AUTHENTICATION
 * This is a frontend-only session mechanism for prototype/demo purposes.
 * It does NOT provide real security. Frontend route guards do NOT
 * replace backend authorization.
 * 
 * In production, authentication will use JWT tokens validated by the backend.
 * 
 * Demo Credentials:
 *   Email:    admin@srkrcafeteria.demo
 *   Password: AdminDemo123!
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../services/storageService';
import { apiRequest, clearApiToken, getApiToken, setApiToken } from '../services/apiClient';

const AuthContext = createContext(null);

// Demo credentials — NOT stored in localStorage, only checked on login
const DEMO_CREDENTIALS = {
  email: 'admin@srkrcafeteria.demo',
  password: 'AdminDemo123!',
  name: 'Admin',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = getStoredAuth();
    const token = getApiToken();
    // A local session without its API token cannot access protected routes.
    if (stored && stored.isAuthenticated && token) {
      return stored;
    }
    if (stored || token) {
      clearStoredAuth();
      clearApiToken();
    }
    return null;
  });

  const login = useCallback(async (email, password) => {
    try {
      const { token, user } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const session = {
        isAuthenticated: true,
        name: user.name,
        email: user.email,
        role: user.role,
        loginTime: new Date().toISOString(),
      };
      setApiToken(token);
      setAdmin(session);
      setStoredAuth(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    clearApiToken();
    clearStoredAuth();
  }, []);

  const isAuthenticated = admin?.isAuthenticated === true;

  const value = {
    admin,
    isAuthenticated,
    login,
    logout,
    demoCredentials: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    },
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
