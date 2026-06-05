import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenService } from '../services/auth/tokenService';
import { authService } from '../services/auth/authService';
import { setSessionExpiredCallback } from '../services/api';
import { userService } from '../services/userService';

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: string | null;
  shopId: string | null;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (newRole: string) => Promise<void>;
  updateShopId: (newShopId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await tokenService.getAccessToken();
      const savedRole = await tokenService.getRole();
      const savedShopId = await tokenService.getShopId();
      setIsLoggedIn(!!token);
      setRole(savedRole);
      setShopId(savedShopId);
      setIsLoading(false);
    };
    checkToken();
  }, []);

  // Wire up the callback so the api client can force a logout when a token refresh fails.
  useEffect(() => {
    setSessionExpiredCallback(() => {
      setIsLoggedIn(false);
      setRole(null);
      setShopId(null);
    });
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    const { role: newRole, shopId: newShopId } = await authService.login(credentials);
    await tokenService.setRole(newRole);
    await tokenService.setShopId(newShopId);
    setIsLoggedIn(true);
    setRole(newRole);
    setShopId(newShopId);
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setRole(null);
    setShopId(null);
  };

  const updateRole = async (newRole: string) => {
    await tokenService.setRole(newRole);
    setRole(newRole);
  };

  const updateShopId = async (newShopId: string) => {
    await tokenService.setShopId(newShopId);
    setShopId(newShopId);
  };

  const deleteAccount = async () => {
    await userService.deleteAccount();
    await tokenService.clearTokens();
    setIsLoggedIn(false);
    setRole(null);
    setShopId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, role, shopId, login, logout, updateRole, updateShopId, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
