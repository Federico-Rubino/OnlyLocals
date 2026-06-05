import apiClient from './api';

export interface Location {
  type: 'Point';
  coordinates: number[];
}

export interface TimeSlot {
  location: Location;
  latitudine?: number;
  longitudine?: number;
  indirizzo: string;
}

export interface DaySchedule {
  mattina: TimeSlot | null;
  pomeriggio: TimeSlot | null;
  sera: TimeSlot | null;
}

export interface Itinerario {
  lunedi?: DaySchedule;
  martedi?: DaySchedule;
  mercoledi?: DaySchedule;
  giovedi?: DaySchedule;
  venerdi?: DaySchedule;
  sabato?: DaySchedule;
  domenica?: DaySchedule;
}

export interface SearchResult {
  _id: string;
  name: string;
  itinerario: Itinerario;
}

export interface SearchResponse {
  success: boolean;
  results: number;
  data: SearchResult[];
}

export interface SearchFilters {
  name?: string;
  category?: string[]; // Array of strings for multi-selection
  lat?: number;
  lng?: number;
  radius?: number;
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slot?: 'morning' | 'afternoon' | 'evening';
}

export const searchShop = async (filters: SearchFilters): Promise<SearchResponse> => {
  const cleanParams: any = {};

  if (filters.name && filters.name.trim() !== '') {
    cleanParams.name = filters.name.trim();
  }

  if (filters.category && filters.category.length > 0) {
    cleanParams.category = filters.category;
  }

  const response = await apiClient.get<SearchResponse>('/shops/search', {
    params: cleanParams,
    // axios does not repeat array keys by default so we serialize manually to get category=a&category=b
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value as string);
        }
      });
      return searchParams.toString();
    },
  });

  return response.data;
};