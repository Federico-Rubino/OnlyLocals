import * as SecureStore from 'expo-secure-store';

const KEY = 'location_enabled';

export const locationPreference = {
  get: async (): Promise<boolean> => {
    const val = await SecureStore.getItemAsync(KEY);
    // Location is enabled by default. The user has to explicitly turn it off.
    return val !== 'false';
  },
  set: async (enabled: boolean): Promise<void> => {
    await SecureStore.setItemAsync(KEY, enabled ? 'true' : 'false');
  },
};
