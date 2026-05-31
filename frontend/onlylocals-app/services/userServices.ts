import apiClient from './api';
import { RegisterPayload, RegisterResponse } from '../types/user';

function toISODate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

export const userService = {

  addFavorites: async (shopId: string) => {
    const response = await apiClient.post('/users/favorites', { shopId });
    return response.data.data;
  },

  removeFavorites: async (shopId: string) => {
    const response = await apiClient.delete('/users/favorites', {
      data: { shopId },
    });
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await apiClient.post('/users/register', {
      name: payload.name,
      surname: payload.surname,
      bornDate: toISODate(payload.birthDate),
      email: payload.email,
      username: payload.username,
      password: payload.password,
    });
    return response.data.data;
  },

  setAsCustomer: async (): Promise<void> => {
    await apiClient.patch('/users/setAsCustomer');
  },
};
