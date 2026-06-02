import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import LoginForm from '../../components/loginForm';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); 
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Inserisci email/username e password.');
      return;
    }

    setIsLoading(true);

    try {
      await login({ identifier: identifier.trim(), password });
      router.replace('/(customer)/(tabs)');
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || 'Credenziali non valide o server non raggiungibile.';
      Alert.alert('Accesso Negato', serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
        <Text style={styles.backText}>← Torna alla home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>

      <LoginForm
        identifier={identifier}
        password={password}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        isLoading={isLoading}
      />

      <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerButton}>
        <Text style={styles.registerText}>Non hai un account? <Text style={styles.registerLink}>Registrati</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 10,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
  },
  backText: {
    fontSize: 14,
    color: '#255cb3',
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: '#255cb3',
    fontWeight: '600',
  },
});