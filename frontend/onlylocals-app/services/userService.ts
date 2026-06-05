import apiClient from './api';

export interface UserProfile {
  name: string;
  surname: string;
  email: string;
  bornDate: string;
  role: string;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<void> => {
    await apiClient.patch('/users/profile', data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.patch('/users/change-password', { currentPassword, newPassword });
  },

  getMyData: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data.data;
  },

  getFavorites: async (): Promise<{ _id: string; name: string; category: string }[]> => {
    const response = await apiClient.get('/users/favorites');
    return response.data.data;
  },

  getFidelityCard: async (): Promise<{ barcode: string; shops: { shopName: string; punti: number }[] }> => {
    const response = await apiClient.get('/users/fidelity/points');
    return response.data.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/account');
  },
};