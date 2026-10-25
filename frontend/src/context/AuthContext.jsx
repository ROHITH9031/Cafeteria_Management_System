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
    // Only restore session info (no password stored)
    if (stored && stored.isAuthenticated) {
      return stored;
    }
    return null;
  });

  const login = useCallback((email, password) => {
    if (
      email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() &&
      password === DEMO_CREDENTIALS.password
    ) {
      const session = {
        isAuthenticated: true,
        name: DEMO_CREDENTIALS.name,
        email: DEMO_CREDENTIALS.email,
        role: DEMO_CREDENTIALS.role,
        loginTime: new Date().toISOString(),
      };
      setAdmin(session);
      setStoredAuth(session); // No password stored
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
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
