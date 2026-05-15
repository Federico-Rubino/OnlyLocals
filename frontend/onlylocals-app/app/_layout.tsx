import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

// Hardcoded test user
const TEST_USER = {
  isLoggedIn: true, 
  role: 'vendor'  
};

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Questo useEffect serve a capire quando il Root Layout è montato
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Se il router non è pronto o i segmenti non sono ancora caricati, non fare nulla
    if (!isReady || !segments) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inVendorGroup = segments[0] === '(vendor)';

    // --- LOGICA REINDIRIZZAMENTO ---

    // 1. Caso: Utente NON loggato (GUEST)
    // Se non è loggato e NON si trova già nell'area customer o auth, mandalo a customer
    if (!TEST_USER.isLoggedIn && !inCustomerGroup && !inAuthGroup) {
      router.replace('/(customer)/(tabs)');
    } 
    
    // 2. Caso: Utente VENDOR loggato
    // Se è un vendor e non si trova nell'area vendor, mandalo lì
    if (TEST_USER.isLoggedIn && TEST_USER.role === 'vendor' && !inVendorGroup) {
      router.replace('/(vendor)/(tabs)');
    }

    // 3. Caso: Utente CUSTOMER loggato
    // Se è un customer loggato e sta provando a entrare in auth, rimandalo alla home
    if (TEST_USER.isLoggedIn && TEST_USER.role === 'customer' && inAuthGroup) {
      router.replace('/(customer)/(tabs)');
    }

  }, [isReady, segments]); // Dipende dal montaggio e dal cambio di pagina

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Definizione dei gruppi */}
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
    </Stack>
  );
}