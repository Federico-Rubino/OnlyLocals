// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenService } from '../services/auth/tokenService';
import { authService } from '../services/auth/authService';


const AuthContext = createContext<AuthContextType | null>(null);

// context/AuthContext.tsx
type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: string | null;                   // ← add
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);  // ← add

  useEffect(() => {
    const checkToken = async () => {
      const token = await tokenService.getAccessToken();
      const savedRole = await tokenService.getRole();      // ← restore role
      setIsLoggedIn(!!token);
      setRole(savedRole);                                  // ← restore role
      setIsLoading(false);
    };
    checkToken();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    const { role } = await authService.login(credentials); // ← get role
    await tokenService.setRole(role);                      // ← persist it
    setIsLoggedIn(true);
    setRole(role);                                         // ← set in state
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setRole(null);                                         // ← clear it
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}