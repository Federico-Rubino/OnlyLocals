import { Shop } from '../types/shop';
import apiClient from './api';

interface ShopApiResponse {
  success: boolean;
  data: Shop;
  message?: string;
}

export const getShopById = async (id: string): Promise<Shop> => {
  const response = await apiClient.get<ShopApiResponse>(`/shops/${id}`);
  return response.data.data;
};

export const shopService = { getShopById };

export const addPromozione = async (data: {
  description: string;
  value: string;
  startDate: string;
  endDate: string;
}): Promise<void> => {
  await apiClient.post('/shops/promotion', data);
};

export const deletePromozione = async (description: string): Promise<void> => {
  await apiClient.delete(`/shops/promotion?description=${encodeURIComponent(description)}`);
};

export const addEvento = async (data: {
  name: string;
  description: string;
  date: string;
}): Promise<void> => {
  await apiClient.post('/shops/event', data);
};

export const deleteEvento = async (name: string): Promise<void> => {
  await apiClient.delete('/shops/event', { data: { name } });
};

export const updateShop = async (data: {
  name: string;
  description: string;
}): Promise<void> => {
  await apiClient.put('/shops/update', data);
};

export interface ItinerarioSlotPayload {
  latitudine: number;
  longitudine: number;
  indirizzo?: string;
}

export type ItinerarioPayload = Record<
  string,
  Record<string, ItinerarioSlotPayload>
>;

export const registerShop = async (data: {
  name: string;
  description: string;
  category: string[];
  itinerario?: ItinerarioPayload;
}): Promise<{ newRole: string; id: string }> => {
  const response = await apiClient.post('/shops/register', data);
  return response.data;
};

