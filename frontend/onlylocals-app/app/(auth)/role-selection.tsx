import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { updateRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelectCustomer = async () => {
    setLoading(true);
    try {
      await apiClient.patch('/users/setAsCustomer');
      await updateRole('customer');
      router.replace('/(customer)/(tabs)');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile impostare il ruolo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benvenuto!</Text>
      <Text style={styles.subtitle}>Come vuoi usare OnlyLocals?</Text>

      <TouchableOpacity style={styles.option} onPress={handleSelectCustomer} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.optionTitle}>Cliente</Text>
            <Text style={styles.optionDesc}>Scopri e salva i negozi locali</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  option: {
    width: '100%',
    backgroundColor: '#255cb3',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
