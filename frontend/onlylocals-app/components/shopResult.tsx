// components/ShopResult.tsx
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Shop } from '../types/shop';

// Definiamo le Props necessarie per la visualizzazione
interface ShopResultProps {
  isLoading: boolean;
  errorMessage: string;
  shopData: Shop | null;
}

export default function ShopResult({ 
  isLoading, 
  errorMessage, 
  shopData 
}: ShopResultProps) {
  
  // 1. Stato di caricamento
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Recupero dati dal server...</Text>
      </View>
    );
  }

  // 2. Stato di errore
  if (errorMessage) {
    return (
      <View style={[styles.centerContainer, styles.errorBox]}>
        <Text style={styles.errorText}>error {errorMessage}</Text>
      </View>
    );
  }

  // 3. Stato di successo (Dati ricevuti)
  // 3. Stato di successo (Dati ricevuti e formattati)
  if (shopData) {
    const { itinerario, events, promotions } = shopData;
    const lunediMattina = itinerario?.lunedi?.mattina;

    return (
      <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER: Titolo e Descrizione */}
        <View style={styles.sectionHeader}>
          <Text style={styles.categoryBadge}>
            {shopData.category?.[0] || "Negozio"}
          </Text>
          <Text style={styles.shopName}>{shopData.name}</Text>
          <Text style={styles.description}>{shopData.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* POSIZIONE: Itinerario */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📍 Dove trovarci</Text>
          {lunediMattina ? (
            <View style={styles.card}>
              <Text style={styles.label}>Lunedì Mattina:</Text>
              <Text style={styles.addressText}>{lunediMattina.indirizzo}</Text>
              <View style={styles.coordBadge}>
                <Text style={styles.coordText}>
                  Lat: {lunediMattina.location.coordinates[1]} | Lon: {lunediMattina.location.coordinates[0]}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noData}>Nessun itinerario inserito per oggi.</Text>
          )}
        </View>

        {/* EVENTI: Lista dinamica */}
        <View style={styles.infoSection}>
  <Text style={styles.sectionTitle}>📅 Eventi in Programma</Text>
  {events && events.length > 0 ? (
    events.map((event, index) => {
      // Gestione sicura della data per evitare errori TS e problemi di localizzazione
      const dateObj = new Date(event.date);
      const mesi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
      
      const giorno = dateObj.getDate();
      const mese = mesi[dateObj.getMonth()];

      return (
        <View key={index} style={styles.eventCard}>
          <View style={styles.eventDateBox}>
            <Text style={styles.eventDay}>{giorno}</Text>
            <Text style={styles.eventMonth}>{mese}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDesc}>{event.description}</Text>
          </View>
        </View>
      );
    })
  ) : (
    <Text style={styles.noData}>Nessun evento previsto al momento.</Text>
  )}
</View>

        {/* PROMOZIONI */}
        {promotions && promotions.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>🎁 Promozioni</Text>
            {/* Logica simile agli eventi se vuoi listarle */}
          </View>
        )}
      </ScrollView>
    );
  }

  // Se non c'è caricamento, non ci sono errori e non ci sono dati, non mostriamo nulla (stato iniziale)
  return null;
}

const styles = StyleSheet.create({
    // Container di base
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 30,
    },
    
    // Container Principale dei Dati
    dataContainer: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 600,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#dee2e6',
      marginTop: 10,
      padding: 20,
      // Ombre
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  
    // Header e Badge
    sectionHeader: {
      marginBottom: 20,
    },
    categoryBadge: {
      backgroundColor: '#e7f3ff',
      color: '#007bff',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    shopName: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#212529',
      letterSpacing: -0.5,
    },
    description: {
      fontSize: 16,
      color: '#6c757d',
      marginTop: 6,
      lineHeight: 22,
    },
  
    // Sezioni e Titoli
    infoSection: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#343a40',
      marginBottom: 12,
    },
  
    // Card per Indirizzo ed Eventi
    card: {
      backgroundColor: '#f8f9fa',
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: '#eceef0',
    },
    label: {
      fontSize: 13,
      color: '#868e96',
      fontWeight: '600',
      marginBottom: 2,
    },
    addressText: {
      fontSize: 16,
      color: '#212529',
      fontWeight: '500',
    },
    
    // Eventi
    eventCard: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#f1f3f5',
      // Effetto rilievo leggero per le card interne
      elevation: 1,
    },
    eventDateBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 15,
      borderRightWidth: 1,
      borderRightColor: '#eee',
      minWidth: 55,
    },
    eventDay: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#007bff',
    },
    eventMonth: {
      fontSize: 11,
      color: '#adb5bd',
      fontWeight: '700',
    },
    eventDetails: {
      flex: 1,
      paddingLeft: 15,
      justifyContent: 'center',
    },
    eventName: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#212529',
    },
    eventDesc: {
      fontSize: 13,
      color: '#6c757d',
    },
  
    // Stati di Caricamento ed Errore
    loadingText: {
      marginTop: 15,
      color: '#6c757d',
      fontSize: 16,
    },
    errorBox: {
      backgroundColor: '#fff5f5',
      borderColor: '#ffc9c9',
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
    },
    errorText: {
      color: '#fa5252',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    noData: {
      fontSize: 14,
      color: '#adb5bd',
      fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef', // Grigio chiarissimo per non appesantire
        marginVertical: 20,
        width: '100%',
      },
      
    coordBadge: {
        marginTop: 12,
        backgroundColor: '#f1f3f5', // Sfondo neutro
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderStyle: 'dashed', // Effetto "coordinate/mappa"
      },
      
    coordText: {
        fontSize: 12,
        fontFamily: 'monospace', // Font tecnico
        color: '#007bff',        // Colore che richiama i link/mappe
        fontWeight: '500',
      }
  });