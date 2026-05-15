import { Shop } from '../types/shop';
import apiClient from './api';

export const getShopById = async (id: string): Promise<Shop> => {
  // Definiamo la struttura attesa direttamente qui, senza creare un tipo a parte
  const response = await apiClient.get<{ success: boolean; data: Shop }>(`/shops/${id}`);
  
  return response.data.data; 
};

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