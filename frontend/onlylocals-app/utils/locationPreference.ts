import * as SecureStore from 'expo-secure-store';

const KEY = 'location_enabled';

export const locationPreference = {
  get: async (): Promise<boolean> => {
    const val = await SecureStore.getItemAsync(KEY);
    return val !== 'false'; // default true se mai impostato
  },
  set: async (enabled: boolean): Promise<void> => {
    await SecureStore.setItemAsync(KEY, enabled ? 'true' : 'false');
  },
};
