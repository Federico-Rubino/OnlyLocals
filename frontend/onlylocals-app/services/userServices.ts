import apiClient from './api';
import { RegisterPayload, RegisterResponse } from '../types/user';

export type FidelityShopEntry = {
  shopId: string;
  shopName: string;
  punti: number;
  vantaggi: { descrizione: string; sogliaPunti: number }[];
};

export type FidelityCardData = {
  barcode: string;
  shops: FidelityShopEntry[];
};

export type SavedSearch = {
  name?: string;
  categories?: string[];
  raw: string;
};

export const getFidelityCard = async (): Promise<FidelityCardData> => {
  const response = await apiClient.get<{ success: boolean; data: FidelityCardData }>('/users/fidelity/points');
  return response.data.data;
};

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

  saveSearch: async (name?: string, categories?: string[]): Promise<void> => {
    await apiClient.post('/users/searches', { name, categories });
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get<{ success: boolean; data: SavedSearch[] }>('/users/searches');
    return response.data.data;
  },

  removeSearch: async (raw: string): Promise<void> => {
    await apiClient.delete('/users/searches', { data: { search: raw } });
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
