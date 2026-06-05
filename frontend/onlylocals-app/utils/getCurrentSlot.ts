export type DayKey = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica';
export type SlotKey = 'mattina' | 'pomeriggio' | 'sera';

// Date.getDay() returns 0 for Sunday, so the array starts with 'domenica' to align the indexes.
const DAY_MAP: DayKey[] = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];

export const getCurrentDayKey = (): DayKey => {
  return DAY_MAP[new Date().getDay()];
};

export const getCurrentSlotKey = (): SlotKey => {
  const hour = new Date().getHours();
  if (hour < 13) return 'mattina';     // 00:00 – 12:59
  if (hour < 18) return 'pomeriggio'; // 13:00 – 17:59
  return 'sera';                       // 18:00 – 23:59
};