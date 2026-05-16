// app/_layout.tsx
import { AuthProvider, useAuth} from '../context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

function DebugLogoutButton() {
  const { logout } = useAuth();


  return (
    <View style={styles.debugContainer}>
      <TouchableOpacity style={styles.debugButton} onPress={logout}>
        <Text style={styles.debugText}>⚠ DEV Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

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

    const inAuthGroup     = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inVendorGroup   = segments[0] === '(vendor)';

    // 1. Guest → browse as customer
    if (!isLoggedIn && !inCustomerGroup && !inAuthGroup) {
      router.replace('/(customer)/(tabs)');
      return;
    }

    if (!isLoggedIn) return;

    // 2. Vendor → vendor area
    if (role === 'vendor' && !inVendorGroup) {
      router.replace('/(vendor)/(tabs)');
      return;
    }

    // 3. Customer or Pending → customer area, block auth pages
    if ((role === 'customer' || role === 'pending') && inAuthGroup) {
      router.replace('/(customer)/(tabs)');
      return;
    }

  }, [isReady, segments, isLoggedIn, isLoading, role]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
        <Stack.Screen name="(vendor)"   options={{ headerShown: false }} />
      </Stack>

      <DebugLogoutButton />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    zIndex: 9999,
  },
  debugButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.85,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});