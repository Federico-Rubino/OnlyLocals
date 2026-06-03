import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '../../services/auth/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { recoveryToken } = useLocalSearchParams<{ recoveryToken: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = newPassword.length >= 8 && newPassword === confirmPassword;

  const handleReset = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(recoveryToken, newPassword);
      Alert.alert(
        'Password aggiornata',
        'La tua password è stata cambiata con successo. Accedi con le nuove credenziali.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Token non valido o scaduto. Ricomincia dal login.';
      Alert.alert('Errore', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Nuova password</Text>
      <Text style={styles.subtitle}>Scegli una nuova password di almeno 8 caratteri.</Text>

      <TextInput
        style={styles.input}
        placeholder="Nuova password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      {passwordTooShort && (
        <Text style={styles.errorText}>La password deve avere almeno 8 caratteri.</Text>
      )}

      <TextInput
        style={[styles.input, passwordMismatch && styles.inputError]}
        placeholder="Conferma password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      {passwordMismatch && (
        <Text style={styles.errorText}>Le password non coincidono.</Text>
      )}

      <TouchableOpacity
        style={[styles.button, (!isValid || isLoading) && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={!isValid || isLoading}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Salva nuova password</Text>
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
    marginBottom: 6,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    alignSelf: 'flex-start',
    color: '#e53935',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    maxWidth: 500,
    height: 50,
    backgroundColor: '#255cb3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
