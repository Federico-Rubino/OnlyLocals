// components/ShopSearchForm.tsx
import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

// Definiamo qui cosa si aspetta di ricevere questo componente
interface ShopSearchFormProps {
  shopId: string;
  onShopIdChange: (id: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export default function ShopSearchForm({ 
  shopId, 
  onShopIdChange, 
  onSearch, 
  isLoading 
}: ShopSearchFormProps) {
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Inserisci l'ID del negozio (es. 65f...)"
        value={shopId}
        onChangeText={onShopIdChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Ricerca in corso..." : "Cerca Negozio"} 
          onPress={onSearch} 
          disabled={isLoading || shopId.trim() === ''} 
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
    overflow: 'hidden', // Evita che il bottone esca dai bordi su iOS
  },
});