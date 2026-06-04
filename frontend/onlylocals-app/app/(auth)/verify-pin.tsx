import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '../../services/auth/authService';

const PIN_LENGTH = 6;

export default function VerifyPinScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>(Array(PIN_LENGTH).fill(null));

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const pin = digits.join('');
  const isComplete = pin.length === PIN_LENGTH;

  const handleVerify = async () => {
    if (!isComplete) return;
    setIsLoading(true);
    try {
      const recoveryToken = await authService.verifyPin(email, pin);
      router.push({ pathname: '/(auth)/reset-password', params: { recoveryToken } });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Codice non valido. Riprova.';
      Alert.alert('Errore', msg);
      // Clear the PIN on failure so the user can re-enter
      setDigits(Array(PIN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email);
      Alert.alert('Codice inviato', 'Ti abbiamo inviato un nuovo codice.');
      setDigits(Array(PIN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      Alert.alert('Errore', 'Impossibile inviare il codice. Riprova più tardi.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Indietro</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Inserisci il codice</Text>
      <Text style={styles.subtitle}>
        Abbiamo inviato un codice a 6 cifre a{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.pinRow}>
        {digits.map((digit, i) => (
          <TextInput
            key={i}
            ref={ref => { inputRefs.current[i] = ref; }}
            style={[styles.pinBox, digit !== '' && styles.pinBoxFilled]}
            value={digit}
            onChangeText={text => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            textAlign="center"
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, (!isComplete || isLoading) && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={!isComplete || isLoading}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Conferma codice</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
        <Text style={styles.resendText}>Non hai ricevuto il codice? <Text style={styles.resendLink}>Reinvia</Text></Text>
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
    marginBottom: 36,
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#1a2a4a',
    fontWeight: '600',
  },
  pinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  pinBox: {
    width: 46,
    height: 58,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2a4a',
  },
  pinBoxFilled: {
    borderColor: '#255cb3',
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
  resendBtn: {
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#255cb3',
    fontWeight: '600',
  },
});
