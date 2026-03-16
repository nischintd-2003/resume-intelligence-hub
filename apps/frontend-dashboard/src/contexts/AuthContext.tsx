/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthContextType, AuthResponseDTO, BootstrapResult, User } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { AUTH_STORAGE_KEYS } from '../constants/auth.constants';
import { isTokenExpired } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function bootstrapAuth(): BootstrapResult {
  if (isTokenExpired()) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    return { user: null, isAuthenticated: false };
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!raw) return { user: null, isAuthenticated: false };

  try {
    const user = JSON.parse(raw) as User;
    return { user, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => bootstrapAuth().user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => bootstrapAuth().isAuthenticated,
  );

  const isValidating = false;

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback((data: AuthResponseDTO) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isValidating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}
