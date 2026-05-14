// types/shop.ts

export type ShopCategory = 
  | 'Ortofrutta' 
  | 'Macelleria & Salumi' 
  | 'Latteria & Formaggi' 
  | 'Pescheria' 
  | 'Gastronomia & Drink' 
  | 'Abbigliamento' 
  | 'Artigianato & Design'
  | 'Libri & Media'
  | 'Eventi & Pop-up'
  | 'Musei & Mostre'
  | 'Benessere & Fitness'
  | 'Ristorazione'
  | 'Tecnologia & Elettronica'
  | 'Casa & Giardino'
  | 'Giocattoli & Bambini'
  | 'Animali & Accessori'
  | 'Servizi & Professionisti';

export interface PointLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitudine, latitudine]
}

export interface Position {
  location: PointLocation;
  indirizzo?: string;
}

export interface DayItinerary {
  mattina: Position | null;
  pomeriggio: Position | null;
  sera: Position | null;
}

export interface Itinerary {
  lunedi?: DayItinerary;
  martedi?: DayItinerary;
  mercoledi?: DayItinerary;
  giovedi?: DayItinerary;
  venerdi?: DayItinerary;
  sabato?: DayItinerary;
  domenica?: DayItinerary;
}

export interface Event {
  name: string;
  description: string;
  date: string; // stringa ISO
}

export interface Promotion {
  description: string;
  value: string;
  startDate: string;
  endDate: string;
}

// L'oggetto Shop finale, pulito e isolato
export interface Shop {
  name: string;
  description: string;
  category: ShopCategory[];
  itinerario: Itinerary;
  events: Event[];
  promotions: Promotion[];
}