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
  name?: string;
  description?: string;
  itinerario?: Record<string, any>;
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

export interface ItinerarioSlotPayload {
  latitudine: number;
  longitudine: number;
  indirizzo?: string;
  oraInizio?: string;
  oraFine?: string;
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

export type Vantaggio = {
  descrizione: string;
  valore: number;
  sogliaPunti: number;
};

export const getVantaggi = async (): Promise<Vantaggio[]> => {
  const response = await apiClient.get<{ success: boolean; data: Vantaggio[] }>('/shops/fidelity/vantaggi');
  return response.data.data;
};

export const setVantaggi = async (vantaggi: Vantaggio[]): Promise<void> => {
  await apiClient.put('/shops/fidelity/vantaggi', { vantaggi });
};

export const modifyConversion = async (tasso: number): Promise<void> => {
  await apiClient.put('/shops/fidelity/modifyConversion', { tasso });
};

export const scanCard = async (barcode: string): Promise<{ puntiTotali: number; utente: string }> => {
  const response = await apiClient.post('/shops/fidelity/scan', { barcode });
  return response.data.data;
};

export const addPointsCard = async (barcode: string, importo: number): Promise<{ puntiGuadagnati: number; puntiTotali: number; utente: string }> => {
  const response = await apiClient.post('/shops/fidelity/scan/addPoints', { barcode, importo });
  return response.data.data;
};

export const redeemCard = async (barcode: string, descrizioneVantaggio: string): Promise<{ vantaggio: Vantaggio; puntiRimanenti: number; utente: string }> => {
  const response = await apiClient.post('/shops/fidelity/scan/redeem', { barcode, descrizioneVantaggio });
  return response.data.data;
};

