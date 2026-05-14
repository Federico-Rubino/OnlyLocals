import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenService } from '../services/auth/tokenService';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if tokens exist on app startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = await tokenService.getAccessToken();
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const success = await authService.login(credentials);
    if (success) setIsLoggedIn(true);
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth state anywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};