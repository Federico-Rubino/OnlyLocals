// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { userService } from '../../services/userServices';
import { useAuth } from '../../context/AuthContext';

type Field = 'name' | 'surname' | 'birthDate' | 'email' | 'username' | 'password';

interface FormData {
  name: string;
  surname: string;
  birthDate: string;
  email: string;
  username: string;
  password: string;
}

interface FormErrors {
  name?: string;
  surname?: string;
  birthDate?: string;
  email?: string;
  username?: string;
  password?: string;
}

function formatDateInput(value: string, prev: string): string {
  const digits = value.replace(/\D/g, '');
  if (value.length < prev.length) return value; // allow backspace naturally
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = 'obbligatorio';
  if (!form.surname.trim()) errors.surname = 'obbligatorio';

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!form.birthDate.trim()) {
    errors.birthDate = 'obbligatorio';
  } else if (!dateRegex.test(form.birthDate)) {
    errors.birthDate = 'Use DD/MM/YYYY format';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim()) {
    errors.email = 'obbligatorio';
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Invalid email';
  }

  if (!form.username.trim()) {
    errors.username = 'obbligatorio';
  } else if (form.username.length < 3) {
    errors.username = 'At least 3 characters';
  }

  if (!form.password.trim()) {
    errors.password = 'obbligatorio';
  } else if (form.password.length < 8) {
    errors.password = 'At least 8 characters';
  }

  return errors;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [form, setForm] = useState<FormData>({
    name: '',
    surname: '',
    birthDate: '',
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: Field, value: string) => {
    const next = field === 'birthDate'
      ? formatDateInput(value, form.birthDate)
      : value;

    setForm(prev => ({ ...prev, [field]: next }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await userService.register({
        name:      form.name.trim(),
        surname:   form.surname.trim(),
        birthDate: form.birthDate,
        email:     form.email.trim(),
        username:  form.username.trim(),
        password:  form.password,
      });

      await login({ identifier: form.username.trim(), password: form.password });
      router.replace('/(auth)/role-selection');
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || 'Registrazione fallita. Riprova.';
      Alert.alert('Errore', serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Fill in your details to get started</Text>

      <View style={styles.row}>
        <View style={[styles.fieldWrapper, styles.flex1]}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={v => handleChange('name', v)}
            placeholder="Mario"
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View style={[styles.fieldWrapper, styles.flex1]}>
          <Text style={styles.label}>Cognome</Text>
          <TextInput
            style={[styles.input, errors.surname && styles.inputError]}
            value={form.surname}
            onChangeText={v => handleChange('surname', v)}
            placeholder="Rossi"
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.surname && <Text style={styles.error}>{errors.surname}</Text>}
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Data di nascita</Text>
        <TextInput
          style={[styles.input, errors.birthDate && styles.inputError]}
          value={form.birthDate}
          onChangeText={v => handleChange('birthDate', v)}
          placeholder="DD/MM/YYYY"
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="next"
        />
        {errors.birthDate && <Text style={styles.error}>{errors.birthDate}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={form.email}
          onChangeText={v => handleChange('email', v)}
          placeholder="mario@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          value={form.username}
          onChangeText={v => handleChange('username', v)}
          placeholder="mario_rossi"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
        {errors.username && <Text style={styles.error}>{errors.username}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            placeholder="Min. 8 characters"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(p => !p)}
          >
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Creazione dell'account..." : 'Registra'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.loginButton}>
        <Text style={styles.loginText}>
          Hai già un account? <Text style={styles.loginLink}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#255cb3',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#255cb3',
    fontWeight: '600',
  },
});