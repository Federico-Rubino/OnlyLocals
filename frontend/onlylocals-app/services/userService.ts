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

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },
};