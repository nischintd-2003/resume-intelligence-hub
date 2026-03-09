/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthContextType, AuthResponseDTO, User } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { AUTH_STORAGE_KEYS } from '../constants/auth.constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readUserFromStorage(): User | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  if (!raw || !token) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readUserFromStorage());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => user !== null);

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
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
