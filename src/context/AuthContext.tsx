import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState } from '../types';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAdminOrManager: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then((data) => {
          setAuthState({
            user: data.user,
            token,
            isAuthenticated: true,
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    setAuthState({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    authApi.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const isAdmin = authState.user?.role === 'admin';
  const isAdminOrManager = authState.user?.role === 'admin' || authState.user?.role === 'manager';

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isAdmin, isAdminOrManager, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
