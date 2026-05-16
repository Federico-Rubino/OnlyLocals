import axios from 'axios';
import { tokenService } from './auth/tokenService';

const apiClient = axios.create({
  baseURL: 'https://onlylocals.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


//request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {

    const token = await tokenService.getAccessToken();
    //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWZhZWRhNDdiNzE1NGNhY2Y1YTgwNjYiLCJpYXQiOjE3Nzg4NTA2OTYsImV4cCI6MTc3ODg1MTU5Nn0.kYK5VqU3MkOg-WlYtyQBUlxsJEIkl7DU4lr02SCzPxc';
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3.response interceptor to distinguish publig api from one with login
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Save original request
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await tokenService.getRefreshToken();
        
        if (!refreshToken) {
          //if not refresh token user not logged
          await tokenService.clearTokens();
          return Promise.reject(error);
        }
        const response = await axios.post(`${apiClient.defaults.baseURL}/users/refreshToken`, {
          oldRefreshToken: refreshToken
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken; 
        //save new token
        await tokenService.setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        //If refresh token not working delete all token
        console.error("Refresh token ");
        await tokenService.clearTokens();
        //add event to relogin the user
        return Promise.reject(refreshError);
      }
    }

    //if other error pass to other
    return Promise.reject(error);
  }
);

export default apiClient;