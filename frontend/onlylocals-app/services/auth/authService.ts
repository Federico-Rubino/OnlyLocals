import apiClient from '../api';
import { tokenService } from './tokenService';
import { LoginCredentials, LoginResponse } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    const { accessToken, refreshToken } = response.data;

    await tokenService.setTokens(accessToken, refreshToken);

    const userResponse = await apiClient.get('/users/me');
    const userData = userResponse.data?.data ?? userResponse.data;
    const role = userData?.role ?? null;
    const shopId = userData?.vendorShop ?? null;
    return { role, shopId };
  },

  logout: async () => {
    await tokenService.clearTokens();
  }
};