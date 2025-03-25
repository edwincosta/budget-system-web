import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import config from '../config';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<{ token: string, refreshToken: string }>(`${config.apiBaseUrl}/auth/login`, { email, password });
      if (response.status === 200 && response.data) {
        setIsAuthenticated(true);
        setToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return true;
      } else {
        alert('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error', error);
      alert('Login error');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};