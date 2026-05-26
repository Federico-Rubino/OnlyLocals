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
    try {
      const response = await apiClient.get('/users/me');
      console.log('STATUS:', response.status);
      console.log('DATA:', JSON.stringify(response.data));
      return response.data.data;
    } catch (error: any) {
      console.log('ERRORE STATUS:', error.response?.status);
      console.log('ERRORE DATA:', JSON.stringify(error.response?.data));
      throw error;
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<void> => {
    await apiClient.patch('/users/profile', data);
  },
};