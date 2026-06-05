import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { FeedbackItem, getFeedbacksByShop, submitFeedback } from '../services/shopServices';
import { userService } from '../services/userServices';
import { Shop } from '../types/shop';

Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

interface ShopResultProps {
  isLoading: boolean;
  errorMessage: string;
  shopData: Shop | null;
  shopId: string;
}

const giorniSettimana = [
  'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'
];

export default function ShopResult({ isLoading, errorMessage, shopData, shopId }: ShopResultProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoggedIn, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !shopId) return;
    apiClient.get('/users/favorites')
      .then(res => {
        const list: { _id: string }[] = res.data?.data ?? [];
        setIsFavorite(list.some(f => f._id === shopId));
      })
      .catch(() => {});
  }, [isLoggedIn, shopId]);

  useEffect(() => {
    if (!shopId) return;
    setFeedbacksLoading(true);
    getFeedbacksByShop(shopId)
      .then(data => setFeedbacks(data))
      .catch(() => {})
      .finally(() => setFeedbacksLoading(false));
  }, [shopId]);

  const getOggiIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  const [giornoSelezionato, setGiornoSelezionato] = useState<string>(giorniSettimana[getOggiIndex()]);
  const [fasciaSelezionata, setFasciaSelezionata] = useState<'mattina' | 'pomeriggio' | 'sera'>('mattina');

  const avgRating = feedbacks.length > 0
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
    : 0;

  const handleFavoriteToggle = () => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
      return;
    }
    setIsFavorite(!isFavorite);
    if (isFavorite) {
      userService.removeFavorites(shopId);
    } else {
      userService.addFavorites(shopId);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
      return;
    }
    if (userRating === 0) {
      Alert.alert('Valutazione richiesta', 'Seleziona almeno una stella.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFeedback(shopId, userRating, userComment);
      setUserRating(0);
      setUserComment('');
      getFeedbacksByShop(shopId)
        .then(updated => setFeedbacks(updated))
        .catch(() => {});
    } catch {
      Alert.alert('Errore', 'Non è stato possibile inviare il feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#255cb3" />
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
  const datiGiorno = itinerario?.[giornoSelezionato as keyof typeof itinerario];
  const posizioneAttuale = datiGiorno ? datiGiorno[fasciaSelezionata] : null;

  const today = new Date();
  const activePromotions = shopData.promotions?.filter(p => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return today >= start && today <= end;
  }) ?? [];

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

  const renderStars = (rating: number, size = 16) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={size} color="#fcc419" />
      ))}
    </View>
  );

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
        {feedbacks.length > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#fcc419" />
            <Text style={styles.ratingText}>{avgRating.toFixed(1)} ({feedbacks.length} recensioni)</Text>
          </View>
        )}
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
            <View key={i} style={styles.eventCard}>
              <Text style={styles.eventName}>{e.name}</Text>
              {e.date ? <Text style={styles.eventDate}> {new Date(e.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</Text> : null}
              {e.description ? <Text style={styles.eventDesc}>{e.description}</Text> : null}
            </View>
          ))
        ) : <Text style={styles.noData}>Nessun evento.</Text>}
      </View>

      <View style={styles.divider} />

      {/* PROMOZIONI ATTIVE */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>🏷️ Promozioni attive</Text>
        {activePromotions.length > 0 ? (
          activePromotions.map((p, i) => (
            <View key={i} style={styles.promotionCard}>
              <View style={styles.promotionBadge}>
                <Text style={styles.promotionValue}>{p.value}</Text>
              </View>
              <View style={styles.promotionBody}>
                <Text style={styles.promotionDesc}>{p.description}</Text>
                <Text style={styles.promotionDates}>
                  {new Date(p.startDate).toLocaleDateString('it-IT')} – {new Date(p.endDate).toLocaleDateString('it-IT')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Nessuna promozione attiva.</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* RECENSIONI */}
      <View style={[styles.infoSection, { paddingBottom: 40 }]}>
        <Text style={styles.sectionTitle}>⭐ Recensioni</Text>

        {feedbacksLoading ? (
          <ActivityIndicator size="small" color="#255cb3" />
        ) : feedbacks.length > 0 ? (
          feedbacks.map((f, i) => (
            <View key={i} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackAuthor}>{f.authorName}</Text>
                <Text style={styles.feedbackDate}>{new Date(f.date).toLocaleDateString('it-IT')}</Text>
              </View>
              {renderStars(f.rating)}
              {f.comment ? <Text style={styles.feedbackComment}>{f.comment}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Ancora nessuna recensione.</Text>
        )}

        {isLoggedIn && role === 'customer' && (
          <View style={styles.feedbackForm}>
            <Text style={styles.formTitle}>Lascia una recensione</Text>
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setUserRating(i)}>
                  <Ionicons
                    name={i <= userRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#fcc419"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Aggiungi un commento (opzionale)"
              placeholderTextColor="#aaa"
              multiline
              value={userComment}
              onChangeText={setUserComment}
            />
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitFeedback}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Invia recensione</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!isLoggedIn && (
          <TouchableOpacity style={styles.loginPrompt} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginPromptText}>Accedi per lasciare una recensione</Text>
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dataContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  sectionHeader: { marginTop: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { backgroundColor: '#e8f0fd', color: '#255cb3', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, fontSize: 12, fontWeight: '600' },
  favoriteButton: { padding: 8, backgroundColor: '#fff5f5', borderRadius: 20 },
  favoriteButtonActive: { backgroundColor: '#ffe3e3' },
  shopName: { fontSize: 24, fontWeight: '700', color: '#1a2a4a', marginBottom: 5 },
  description: { fontSize: 15, color: '#6c757d' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 14, color: '#555', marginLeft: 4 },

  customPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  pickerValueText: { fontSize: 16, fontWeight: '500' },
  customPickerOptions: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginTop: 5, elevation: 5 },
  optionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionItemActive: { backgroundColor: '#e8f0fd' },
  optionText: { color: '#444' },
  optionTextActive: { color: '#255cb3', fontWeight: '700' },

  fasceRow: { flexDirection: 'row', marginTop: 15, marginBottom: 15 },
  fasciaTab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 2 },
  fasciaTabActive: { backgroundColor: '#255cb3', borderColor: '#255cb3' },
  fasciaTabDisabled: { backgroundColor: '#f9f9f9', opacity: 0.4 },
  fasciaTabText: { fontSize: 12, fontWeight: '600' },
  fasciaTabTextActive: { color: '#fff' },
  fasciaTabTextDisabled: { color: '#999' },

  mapCardContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  locationInfo: { padding: 15, backgroundColor: '#e8f0fd' },
  locationLabel: { fontSize: 10, color: '#255cb3', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  addressText: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  mapWrapper: { height: 180, width: '100%' },
  map: { flex: 1 },
  markerContainer: { height: 24, width: 24, backgroundColor: 'rgba(37,92,179,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  markerCore: { height: 12, width: 12, backgroundColor: '#255cb3', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },

  emptyCard: { padding: 20, backgroundColor: '#f5f7fa', borderRadius: 10, alignItems: 'center' },
  eventCard: { backgroundColor: '#f5f7fa', padding: 12, borderRadius: 8, marginBottom: 8 },
  eventName: { fontWeight: 'bold', fontSize: 15 },
  eventDate: { color: '#666', fontSize: 13, marginTop: 2 },
  eventDesc: { color: '#444', fontSize: 14, marginTop: 4 },
  noData: { color: '#aaa', fontStyle: 'italic' },
  loadingText: { marginTop: 10 },
  errorBox: { padding: 20, backgroundColor: '#fff5f5', borderRadius: 10 },
  errorText: { color: '#e53935', textAlign: 'center' },

  promotionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff9db', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ffe066' },
  promotionBadge: { backgroundColor: '#ffe066', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 12, minWidth: 60, alignItems: 'center' },
  promotionValue: { fontWeight: '700', color: '#e67700', fontSize: 14 },
  promotionBody: { flex: 1 },
  promotionDesc: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 2 },
  promotionDates: { fontSize: 11, color: '#999' },

  feedbackCard: { backgroundColor: '#f5f7fa', borderRadius: 10, padding: 12, marginBottom: 8 },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  feedbackAuthor: { fontWeight: '700', fontSize: 14, color: '#1a2a4a' },
  feedbackDate: { fontSize: 11, color: '#aaa' },
  starsRow: { flexDirection: 'row', marginBottom: 4 },
  feedbackComment: { fontSize: 13, color: '#555', marginTop: 4 },

  feedbackForm: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 16, marginTop: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#1a2a4a' },
  starPickerRow: { flexDirection: 'row', marginBottom: 12 },
  commentInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#333', marginBottom: 12 },
  submitButton: { backgroundColor: '#255cb3', borderRadius: 8, padding: 14, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  loginPrompt: { marginTop: 12, padding: 14, backgroundColor: '#e8f0fd', borderRadius: 8, alignItems: 'center' },
  loginPromptText: { color: '#255cb3', fontWeight: '600' },
});
