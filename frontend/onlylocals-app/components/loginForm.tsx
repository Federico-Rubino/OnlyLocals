import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';



interface LoginFormProps {
  identifier: string;
  password: string;
  onPasswordChange: (id: string) => void;
  onIdentifierChange: (id: string) => void;
  onLogin: () => void;
  isLoading: boolean;
}

export default function LoginForm({ 
  identifier, 
  password,
  onIdentifierChange, 
  onPasswordChange,
  onLogin, 
  isLoading 
}: LoginFormProps) {
  
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
        //secureTextEntry={true}
      />
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Login in corso" : "Login"} 
          onPress={onLogin} 
          disabled={isLoading || identifier.trim() === '' || password.trim() === ''} 
        />
      </View>
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
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden', //for ios button
  },
});