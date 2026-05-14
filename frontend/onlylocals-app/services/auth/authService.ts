import apiClient from '../api';
import { tokenService } from './tokenService';
import { LoginCredentials, LoginResponse } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    const { accessToken, refreshToken, message} = response.data; 

    await tokenService.setTokens(accessToken, refreshToken);
    console.log("Login :", message);
    
    const userResponse = await apiClient.get('/users/me');
    const role = userResponse.data?.role ?? null;
    return { role };
  },

  logout: async () => {
    await tokenService.clearTokens();
  }
};