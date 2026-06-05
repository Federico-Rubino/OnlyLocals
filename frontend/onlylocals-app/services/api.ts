import axios from 'axios';
import { tokenService } from './auth/tokenService';

// Allows the axios layer to tell React that the session is over without importing AuthContext directly.
let sessionExpiredCallback: (() => void) | null = null;

export function setSessionExpiredCallback(callback: () => void) {
  sessionExpiredCallback = callback;
}

const apiClient = axios.create({
  baseURL: 'https://onlylocals.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  async (config) => {

    const token = await tokenService.getAccessToken();
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // The backend returns 403 when the access token is expired, not 401.
    // _retry is set to true before the refresh attempt so that if the refresh
    // endpoint itself returns a 403, this interceptor won't loop infinitely.
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await tokenService.getRefreshToken();
        
        if (!refreshToken) {
          await tokenService.clearTokens();
          sessionExpiredCallback?.();
          return Promise.reject(error);
        }
        const response = await axios.post(`${apiClient.defaults.baseURL}/users/refreshToken`, {
          oldRefreshToken: refreshToken
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        await tokenService.setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        await tokenService.clearTokens();
        sessionExpiredCallback?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;