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

export interface AccessoEntry {
  data: string;
  valore: number;
}

export interface FeedbackEntry {
  voto: number;
  commento?: string;
  user?: { name?: string; surname?: string } | string | null;
  data: string;
}

export interface StatisticheData {
  nomeShop: string;
  statistiche: {
    numSalvataggi: number;
    votoMedio: number;
    totalFeedback: number;
    mappaAccessi: AccessoEntry[];
    storicoFeedback: FeedbackEntry[];
    ultimoAggiornamento: string;
  } | string;
}

export const getStatistiche = async (): Promise<StatisticheData> => {
  const response = await apiClient.get<{ success: boolean; data: StatisticheData }>('/shops/stats');
  return response.data.data;
};

