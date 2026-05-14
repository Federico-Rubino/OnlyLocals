import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Shop } from '../types/shop';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

// Configurazione Token Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

interface ShopResultProps {
  isLoading: boolean;
  errorMessage: string;
  shopData: Shop | null;
}

const giorniSettimana = [
  'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'
];

export default function ShopResult({ isLoading, errorMessage, shopData }: ShopResultProps) {
  const [isFavorite, setIsFavorite] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isLoggedIn, role } = useAuth();
  const router = useRouter();


  // Calcolo indice giorno (Lun=0, Dom=6)
  const getOggiIndex = () => {
    const day = new Date().getDay(); 
    return day === 0 ? 6 : day - 1;
  };

  const [giornoSelezionato, setGiornoSelezionato] = useState<string>(giorniSettimana[getOggiIndex()]);
  const [fasciaSelezionata, setFasciaSelezionata] = useState<'mattina' | 'pomeriggio' | 'sera'>('mattina');

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (errorMessage || !shopData) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage || "Dati non disponibili"}</Text>
        </View>
      </View>
    );
  }

  const { events, itinerario } = shopData;
  const datiGiorno = itinerario[giornoSelezionato as keyof typeof itinerario];
  const posizioneAttuale = datiGiorno ? datiGiorno[fasciaSelezionata] : null;

  const renderFasciaTab = (label: string, tipo: 'mattina' | 'pomeriggio' | 'sera') => {
    const isDisponibile = datiGiorno && datiGiorno[tipo] !== null;
    const isActive = fasciaSelezionata === tipo;

    return (
      <TouchableOpacity
        disabled={!isDisponibile}
        onPress={() => setFasciaSelezionata(tipo)}
        style={[styles.fasciaTab, isActive && styles.fasciaTabActive, !isDisponibile && styles.fasciaTabDisabled]}
      >
        <Text style={[styles.fasciaTabText, isActive && styles.fasciaTabTextActive, !isDisponibile && styles.fasciaTabTextDisabled]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };


const handleFavoriteToggle = () => {
  if (!isLoggedIn) {
    router.push('/(auth)/login');
    return;
  }
  
  setIsFavorite(!isFavorite);
};

  return (
    <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.sectionHeader}>
        <View style={styles.rowBetween}>
          <Text style={styles.categoryBadge}>{shopData.category?.[0] || "Shop"}</Text>
          <TouchableOpacity onPress={handleFavoriteToggle} style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color="#fa5252" />
          </TouchableOpacity>
        </View>
        <Text style={styles.shopName}>{shopData.name}</Text>
        <View style={styles.ratingContainer}><Ionicons name="star" size={20} color="#fcc419" /></View>
        <Text style={styles.description}>{shopData.description}</Text>
      </View>

      <View style={styles.divider} />

      {/* ITINERARIO */}
      <View style={[styles.infoSection, { zIndex: 2000 }]}>
        <Text style={styles.sectionTitle}>📍 Dove trovarci</Text>
        
        <TouchableOpacity style={styles.customPickerHeader} onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <Text style={styles.pickerValueText}>{giornoSelezionato.charAt(0).toUpperCase() + giornoSelezionato.slice(1)}</Text>
          <Ionicons name={isMenuOpen ? "chevron-up" : "chevron-down"} size={20} color="#6c757d" />
        </TouchableOpacity>

        {isMenuOpen && (
          <View style={styles.customPickerOptions}>
            {giorniSettimana.map((g) => (
              <TouchableOpacity key={g} style={[styles.optionItem, giornoSelezionato === g && styles.optionItemActive]}
                onPress={() => { setGiornoSelezionato(g); setFasciaSelezionata('mattina'); setIsMenuOpen(false); }}>
                <Text style={[styles.optionText, giornoSelezionato === g && styles.optionTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>            
        )}

        <View style={styles.fasceRow}>
          {renderFasciaTab("Mattina", "mattina")}
          {renderFasciaTab("Pomeriggio", "pomeriggio")}
          {renderFasciaTab("Sera", "sera")}
        </View>

        {posizioneAttuale && posizioneAttuale.location ? (
          <View style={styles.mapCardContainer}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Posizione {fasciaSelezionata}</Text>
              <Text style={styles.addressText}>{posizioneAttuale.indirizzo}</Text>
            </View>

            <View style={styles.mapWrapper}>
              <Mapbox.MapView 
                style={styles.map} 
                styleURL={Mapbox.StyleURL.Outdoors}
                logoEnabled={false}
                attributionEnabled={false}
              >
                <Mapbox.Camera 
                  zoomLevel={14} 
                  centerCoordinate={posizioneAttuale.location.coordinates}
                  animationMode={'flyTo'}
                  animationDuration={1000}
                />
                <Mapbox.PointAnnotation id="marker" coordinate={posizioneAttuale.location.coordinates}>
                  <View style={styles.markerContainer}><View style={styles.markerCore} /></View>
                </Mapbox.PointAnnotation>
              </Mapbox.MapView>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}><Text style={styles.noData}>Chiuso o nessun dato.</Text></View>
        )}
      </View>

      <View style={styles.divider} />
      
      {/* EVENTI */}
      <View style={styles.infoSection}>
         <Text style={styles.sectionTitle}>📅 Eventi</Text>
         {events?.length > 0 ? (
           events.map((e, i) => (
             <View key={i} style={styles.eventCard}><Text style={styles.eventName}>{e.name}</Text></View>
           ))
         ) : <Text style={styles.noData}>Nessun evento.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dataContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  sectionHeader: { marginTop: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { backgroundColor: '#e7f3ff', color: '#007bff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, fontSize: 12, fontWeight: 'bold' },
  favoriteButton: { padding: 8, backgroundColor: '#fff5f5', borderRadius: 20 },
  favoriteButtonActive: { backgroundColor: '#ffe3e3' },
  shopName: { fontSize: 24, fontWeight: 'bold', color: '#212529', marginBottom: 5 },
  description: { fontSize: 15, color: '#6c757d' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  
  customPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  pickerValueText: { fontSize: 16, fontWeight: '500' },
  customPickerOptions: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginTop: 5, elevation: 5 },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionItemActive: { backgroundColor: '#e7f3ff' },
  optionText: { color: '#444' },
  optionTextActive: { color: '#007bff', fontWeight: 'bold' },

  fasceRow: { flexDirection: 'row', marginTop: 15, marginBottom: 15 },
  fasciaTab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 2 },
  fasciaTabActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  fasciaTabDisabled: { backgroundColor: '#f9f9f9', opacity: 0.4 },
  fasciaTabText: { fontSize: 12, fontWeight: '600' },
  fasciaTabTextActive: { color: '#fff' },
  fasciaTabTextDisabled: { color: '#999' },

  mapCardContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  locationInfo: { padding: 15, backgroundColor: '#f0f7ff' },
  locationLabel: { fontSize: 10, color: '#007bff', fontWeight: 'bold', textTransform: 'uppercase' },
  addressText: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  mapWrapper: { height: 180, width: '100%' },
  map: { flex: 1 },
  markerContainer: { height: 24, width: 24, backgroundColor: 'rgba(0,123,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  markerCore: { height: 12, width: 12, backgroundColor: '#007bff', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },

  emptyCard: { padding: 20, backgroundColor: '#f8f9fa', borderRadius: 10, alignItems: 'center' },
  eventCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 8 },
  eventName: { fontWeight: 'bold' },
  noData: { color: '#aaa', fontStyle: 'italic' },
  loadingText: { marginTop: 10 },
  errorBox: { padding: 20, backgroundColor: '#fff5f5', borderRadius: 10 },
  errorText: { color: '#fa5252', textAlign: 'center' },
  ratingContainer: { marginLeft: 10 }
});