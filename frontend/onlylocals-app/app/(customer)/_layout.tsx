import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack>
      {/* Questa è la Tab Bar inferiore */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Questa è la pagina dettaglio che si apre SOPRA le tabs */}
      <Stack.Screen 
        name="shop/[id]" 
        options={{ 
          title: 'Dettaglio Negozio',
          headerBackTitle: 'Indietro' 
        }} 
      />

  {/* Settings screens */}
      <Stack.Screen name="settings/settings"      options={{ title: 'Impostazioni',  headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/privacy"       options={{ title: 'Privacy',        headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/appearance"    options={{ title: 'Aspetto',        headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/language"      options={{ title: 'Lingua',         headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/security"      options={{ title: 'Sicurezza',      headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="settings/notifications" options={{ title: 'Notifiche',      headerBackTitle: 'Indietro' }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />

    </Stack>
  );
}