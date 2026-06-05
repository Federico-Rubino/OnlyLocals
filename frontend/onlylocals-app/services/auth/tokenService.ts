import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ROLE_KEY = 'user_role';
const SHOP_ID_KEY = 'vendor_shop_id';

export const tokenService = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens', error);
    }
  },

  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token', error);
      return null;
    }
  },

  setRole: async (role: string) => {
    try {
      await SecureStore.setItemAsync(ROLE_KEY, role);
    } catch (error) {
      console.error('Error saving role', error);
    }
  },

  getRole: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(ROLE_KEY);
    } catch (error) {
      console.error('Error getting role', error);
      return null;
    }
  },

  setShopId: async (shopId: string | null) => {
    try {
      if (shopId) {
        await SecureStore.setItemAsync(SHOP_ID_KEY, shopId);
      } else {
        await SecureStore.deleteItemAsync(SHOP_ID_KEY);
      }
    } catch (error) {
      console.error('Error saving shopId', error);
    }
  },

  getShopId: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SHOP_ID_KEY);
    } catch (error) {
      console.error('Error getting shopId', error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(ROLE_KEY);
      await SecureStore.deleteItemAsync(SHOP_ID_KEY);
    } catch (error) {
      console.error('Error deleting tokens', error);
    }
  },
};
