import apiClient from '../api';
import { tokenService } from './tokenService';
import { LoginCredentials, LoginResponse } from '../../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    //post backend
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    
    //extract response
    const { accessToken, refreshToken, message } = response.data;
    
    //save tokens
    await tokenService.setTokens(accessToken, refreshToken);
    
    //debug
    console.log("Login :", message);
    return true; 
  },

  logout: async () => {
    await tokenService.clearTokens();
  }
};