import { Stack } from 'expo-router';

export default function VendorLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="feedbacks" options={{ headerShown: false }} />
      <Stack.Screen name="itinerario" options={{ headerShown: false }} />
      <Stack.Screen name="settings/settings"   options={{ title: 'Impostazioni', headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/appearance" options={{ title: 'Aspetto',      headerBackTitle: 'Indietro' }} />
    </Stack>
  );
}
