import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import LoginForm from '../components/loginForm';
import { authService } from '../services/auth/authService'; 

export default function LoginScreen() {
  const router = useRouter();
  
  //Mem user data
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  //Callback for login button
  const handleLogin = async () => {
    //Check if complete data
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Inserisci email/username e password.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({ 
        identifier: identifier.trim(), 
        password: password 
      });

      Alert.alert('Successo', 'Login effettuato con successo!');
      
      //router.replace('/');

      console.log("LoginEnd!")
      
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      
      //Get error message
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
    backgroundColor: '#f8f9fa', // Uno sfondo grigio chiarissimo elegante
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