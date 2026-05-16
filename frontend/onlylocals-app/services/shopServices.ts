import { Shop } from '../types/shop';
import apiClient from './api';

interface ShopApiResponse {
  success: boolean;
  data: Shop;
  message?: string;
}

export const shopService = {
  getShopById: async (id: string): Promise<Shop> => {
    const response = await apiClient.get<ShopApiResponse>(`/shops/${id}`);

    return response.data.data; 
  }
};