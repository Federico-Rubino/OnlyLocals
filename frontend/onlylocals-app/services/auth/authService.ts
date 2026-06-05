import apiClient from '../api';
import { tokenService } from './tokenService';
import { LoginCredentials, LoginResponse } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    const { accessToken, refreshToken } = response.data;

    await tokenService.setTokens(accessToken, refreshToken);

    // A pending user (just registered, no role chosen yet) is blocked from
    // /users/me by the backend auth middleware, which only allows pending users
    // to hit /shops/register and /users/setAsCustomer. Treat that as 'pending'.
    try {
      const userResponse = await apiClient.get('/users/me');
      const userData = userResponse.data?.data ?? userResponse.data;
      const role = userData?.role ?? null;
      const shopId = userData?.vendorShop ?? null;
      return { role, shopId };
    } catch (err: any) {
      if (err.response?.status === 403) {
        return { role: 'pending', shopId: null };
      }
      throw err;
    }
  },

  logout: async () => {
    await tokenService.clearTokens();
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/users/forgot-password', { email });
  },

  verifyPin: async (email: string, pin: string): Promise<string> => {
    const response = await apiClient.post('/users/verify-pin', { email, pin });
    return response.data.recoveryToken;
  },

  resetPassword: async (recoveryToken: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/reset-password', { recoveryToken, newPassword });
  },
};