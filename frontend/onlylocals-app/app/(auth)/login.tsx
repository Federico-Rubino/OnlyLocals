import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
      await login({                       
        identifier: identifier.trim(), 
        password: password 
      });

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
      <Text style={styles.title}>Login</Text>

      <LoginForm 
        identifier={identifier}
        password={password}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa', 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
});