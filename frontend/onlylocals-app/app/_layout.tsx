// app/_layout.tsx
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

// Separated so it can use useAuth() (hooks need to be inside the Provider)
function RootNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isLoggedIn, isLoading, role } = useAuth(); 

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !segments || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inVendorGroup = segments[0] === '(vendor)';

    // 1. Guest → allow browsing as customer
    if (!isLoggedIn && !inCustomerGroup && !inAuthGroup) {
      router.replace('/(customer)/(tabs)');
    }

    // 2. Vendor logged in → send to vendor area
    if (isLoggedIn && role === 'vendor' && !inVendorGroup) {
      router.replace('/(vendor)/(tabs)');
    }

    // 3. Customer logged in → don't let them see auth pages
    if (isLoggedIn && role === 'customer' && inAuthGroup) {
      router.replace('/(customer)/(tabs)');
    }

  }, [isReady, segments, isLoggedIn, isLoading]); // ← add isLoggedIn, isLoading

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
    </Stack>
  );
}

// AuthProvider wraps everything so RootNavigator can use useAuth()
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}