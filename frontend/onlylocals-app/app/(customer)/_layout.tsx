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
    </Stack>
  );
}