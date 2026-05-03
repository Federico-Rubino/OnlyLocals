import { Shop } from '../types/shop';
import api from './api';

export const getShopById = async (id: string): Promise<Shop> => {
  // Definiamo la struttura attesa direttamente qui, senza creare un tipo a parte
  const response = await api.get<{ success: boolean; data: Shop }>(`/shops/${id}`);
  
  return response.data.data; 
};