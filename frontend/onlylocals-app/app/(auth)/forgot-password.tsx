import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendPin = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Errore', 'Inserisci la tua email.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(trimmed);
      // Always navigate forward — backend never reveals if email exists
      router.push({ pathname: '/(auth)/verify-pin', params: { email: trimmed } });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? 'Impossibile inviare il codice. Riprova più tardi.';
      Alert.alert('Errore', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Torna al login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Password dimenticata</Text>
      <Text style={styles.subtitle}>
        Inserisci la tua email. Se è registrata, riceverai un codice a 6 cifre.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />

      <TouchableOpacity
        style={[styles.button, (!email.trim() || isLoading) && styles.buttonDisabled]}
        onPress={handleSendPin}
        disabled={!email.trim() || isLoading}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Invia codice</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    maxWidth: 320,
  },
  input: {
    width: '100%',
    maxWidth: 500,
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    maxWidth: 500,
    height: 50,
    backgroundColor: '#255cb3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#8aaad9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
