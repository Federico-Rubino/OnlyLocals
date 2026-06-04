// app/_layout.tsx
import { AuthProvider, useAuth} from '../context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const TEST_USER = {
  isLoggedIn: true, 
  role: 'vendor'  
};

export const ThemeContext = createContext({
  theme: 'light' as 'light' | 'dark',
  setTheme: (t: 'light' | 'dark') => {},
});

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

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { isLoggedIn, isLoading, role } = useAuth();

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !segments || isLoading) return;

    const inAuthGroup     = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inVendorGroup   = segments[0] === '(vendor)';
    const onRoleSelection = inAuthGroup && segments[1] === 'role-selection';

    // 1. Guest → browse as customer
    if (!isLoggedIn && !inCustomerGroup && !inAuthGroup) {
      router.replace('/(customer)/(tabs)');
      return;
    }

    if (!isLoggedIn) return;

    // 2. Pending → must complete role selection
    if (role === 'pending') {
      if (!onRoleSelection) router.replace('/(auth)/role-selection');
      return;
    }

    // 3. Vendor → vendor area
    if (role === 'vendor' && !inVendorGroup) {
      router.replace('/(vendor)/(tabs)');
      return;
    }

    // 4. Customer → customer area, block auth pages
    if (role === 'customer' && inAuthGroup) {
      router.replace('/(customer)/(tabs)');
      return;
    }

  }, [isReady, segments, isLoggedIn, isLoading, role]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme === 'dark' ? '#121212' : '#f5f7fa' } 
        }}
      >
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
      </Stack>
    </ThemeContext.Provider>
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