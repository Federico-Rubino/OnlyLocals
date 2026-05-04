import React from 'react';
import { Redirect } from 'expo-router';

export default function AppStart() {
  // Questo componente non mostra nessuna grafica, 
  // prende l'utente e lo lancia immediatamente sulla pagina /login
  return <Redirect href="/login" />;
}

//// app/index.tsx
//import React, { useState } from 'react';
//import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
//
//// 1. Importiamo il servizio per la chiamata API
//import { getShopById } from '../services/shopServices';
//
//// 2. Importiamo il tipo per i dati
//import { Shop } from '../types/shop';
//
//// 3. Importiamo i nostri componenti UI
//import ShopResult from '../components/shopResult';
//import ShopSearchForm from '../components/shopSearchForm';
//
//export default function ShopSearchScreen() {
//  // --- STATO DELL'APPLICAZIONE ---
//  const [shopId, setShopId] = useState<string>('');
//  const [shopData, setShopData] = useState<Shop | null>(null);
//  const [isLoading, setIsLoading] = useState<boolean>(false);
//  const [errorMessage, setErrorMessage] = useState<string>('');
//
//  // --- LOGICA DI RICERCA ---
//  const handleSearch = async () => {
//    // Evita chiamate a vuoto
//    if (!shopId.trim()) {
//      setErrorMessage('Inserisci un ID per continuare');
//      return;
//    }
//
//    // Chiude la tastiera del telefono
//    Keyboard.dismiss();
//
//    // Reset dello stato prima della nuova chiamata
//    setIsLoading(true);
//    setErrorMessage('');
//    setShopData(null); 
//
//    try {
//      // Usiamo il servizio isolato
//      const data = await getShopById(shopId);
//      setShopData(data);
//    } catch (error: any) {
//      // Gestione errori ottimizzata per Axios
//      if (error.response) {
//        // Il server ha risposto ma con un errore (es. 404, 500)
//        setErrorMessage(
//          error.response.status === 404 
//            ? "Negozio non trovato. Controlla l'ID e riprova." 
//            : `Errore del server (${error.response.status}). Riprova più tardi.`
//        );
//      } else if (error.request) {
//        // Il server non ha risposto (es. offline o CORS)
//        setErrorMessage("Impossibile contattare il server. Verifica la connessione.");
//      } else {
//        // Altri errori
//        setErrorMessage(error.message || "Qualcosa è andato storto.");
//      }
//    } finally {
//      setIsLoading(false);
//    }
//  };
//
//  // --- RENDER DELLA SCHERMATA ---
//  return (
//    <SafeAreaView style={styles.safeArea}>
//      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//        
//        {/* Intestazione */}
//        <View style={styles.header}>
//          <Text style={styles.title}>OnlyLocals Admin</Text>
//          <Text style={styles.subtitle}>Ricerca Negozi dal Database</Text>
//        </View>
//
//        {/* Componente: Form di ricerca */}
//        <ShopSearchForm 
//          shopId={shopId} 
//          onShopIdChange={setShopId} 
//          onSearch={handleSearch} 
//          isLoading={isLoading} 
//        />
//
//        {/* Componente: Risultati della ricerca */}
//        <ShopResult 
//          isLoading={isLoading} 
//          errorMessage={errorMessage} 
//          shopData={shopData} 
//        />
//
//      </ScrollView>
//    </SafeAreaView>
//  );
//}
//
//// --- STILI DELLA SCHERMATA ---
//const styles = StyleSheet.create({
//  safeArea: {
//    flex: 1,
//    backgroundColor: '#f8f9fa',
//  },
//  container: {
//    flexGrow: 1,
//    padding: 20,
//    alignItems: 'center',
//  },
//  header: {
//    marginBottom: 30,
//    alignItems: 'center',
//    marginTop: 20,
//  },
//  title: {
//    fontSize: 28,
//    fontWeight: 'bold',
//    color: '#212529',
//  },
//  subtitle: {
//    fontSize: 16,
//    color: '#6c757d',
//    marginTop: 5,
//  },
//});