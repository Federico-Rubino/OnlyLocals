import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

interface LoginFormProps {
  identifier: string;
  password: string;
  onPasswordChange: (id: string) => void;
  onIdentifierChange: (id: string) => void;
  onLogin: () => void;
  onForgotPassword?: () => void;
  isLoading: boolean;
}

export default function LoginForm({
  identifier,
  password,
  onIdentifierChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
  isLoading
}: LoginFormProps) {
  
  const isDisabled = isLoading || identifier.trim() === '' || password.trim() === '';

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Inserisci Username o Email"
        value={identifier}
        onChangeText={onIdentifierChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Inserisci la Password"
        value={password}
        onChangeText={onPasswordChange}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
      />
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onLogin}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Login</Text>
        }
      </TouchableOpacity>

      {onForgotPassword && (
        <TouchableOpacity onPress={onForgotPassword} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Hai dimenticato la password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
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
  forgotBtn: {
    marginTop: 14,
    alignSelf: 'center',
  },
  forgotText: {
    color: '#255cb3',
    fontSize: 14,
    fontWeight: '500',
  },
});