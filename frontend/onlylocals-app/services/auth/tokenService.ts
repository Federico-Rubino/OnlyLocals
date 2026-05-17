import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ROLE_KEY = 'user_role';

export const tokenService = {
  // Save access and refresh token
  setTokens: async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens', error);
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token', error);
      return null;
    }
  },

  // Save role
  setRole: async (role: string) => {
    try {
      await SecureStore.setItemAsync(ROLE_KEY, role);
    } catch (error) {
      console.error('Error saving role', error);
    }
  },

  // Get role
  getRole: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ROLE_KEY);
    } catch (error) {
      console.error('Error getting role', error);
      return null;
    }
  },

  // Delete everything
  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ROLE_KEY);
    } catch (error) {
      console.error('Error deleting tokens', error);
    }
  },
};