import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import config from '../config';
import { ApiResponse, IUserExtended } from 'budget-system-shared';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: IUserExtended | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<IUserExtended | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<{ token: string; refreshToken: string; user: IUserExtended }>>(
        `${config.apiBaseUrl}/auth/login`,
        { email, password }
      );

      if (response.status === 200 && response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data;
        setIsAuthenticated(true);
        setToken(token);
        setUser(user);
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        return true;
      } else {
        alert(response.data.message || 'Login failed');
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
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
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