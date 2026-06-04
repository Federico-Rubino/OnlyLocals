import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ItineraryBuilder, {
  DayKey,
  ItineraryState,
  SlotKey,
} from '../../components/ItineraryBuilder';
import { PickedLocation } from '../../components/LocationPickerModal';
import { useAuth } from '../../context/AuthContext';
import { DayItinerary, Itinerary, Position } from '../../types/shop';
import { getShopById, updateShop } from '../../services/shopServices';

// ── conversions ──────────────────────────────────────────────────────────────

function positionToPickedLocation(pos: Position | null | undefined): PickedLocation | undefined {
  if (!pos?.location?.coordinates) return undefined;
  const [lng, lat] = pos.location.coordinates;
  return { latitudine: lat, longitudine: lng, indirizzo: pos.indirizzo ?? '' };
}

function dbToState(itinerario: Itinerary | undefined): ItineraryState {
  if (!itinerario) return {};
  const days: DayKey[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  const slots: SlotKey[] = ['mattina', 'pomeriggio', 'sera'];
  const state: ItineraryState = {};

  days.forEach(day => {
    const dayData = itinerario[day] as DayItinerary | undefined;
    if (!dayData) return;
    const daySlots: Partial<Record<SlotKey, PickedLocation>> = {};
    slots.forEach(slot => {
      const loc = positionToPickedLocation(dayData[slot]);
      if (loc) daySlots[slot] = loc;
    });
    if (Object.keys(daySlots).length > 0) state[day] = daySlots;
  });
  return state;
}

function stateToDb(state: ItineraryState): Record<string, any> {
  const days: DayKey[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  const slots: SlotKey[] = ['mattina', 'pomeriggio', 'sera'];
  const result: Record<string, any> = {};

  days.forEach(day => {
    const daySlots = state[day];
    const dayObj: Record<string, any> = {};
    slots.forEach(slot => {
      const loc = daySlots?.[slot];
      dayObj[slot] = loc
        ? { location: { type: 'Point', coordinates: [loc.longitudine, loc.latitudine] }, indirizzo: loc.indirizzo }
        : null;
    });
    result[day] = dayObj;
  });
  return result;
}

// ── screen ───────────────────────────────────────────────────────────────────

export default function ItinerarioScreen() {
  const router = useRouter();
  const { shopId } = useAuth();

  const [itineraryState, setItineraryState] = useState<ItineraryState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadItinerario = useCallback(async () => {
    if (!shopId) { setLoading(false); return; }
    try {
      const shop = await getShopById(shopId);
      setItineraryState(dbToState(shop.itinerario));
    } catch {
      Alert.alert('Errore', 'Impossibile caricare l\'itinerario');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadItinerario(); }, [loadItinerario]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShop({ itinerario: stateToDb(itineraryState) });
      Alert.alert('Salvato', 'Itinerario aggiornato con successo!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Errore', 'Impossibile salvare l\'itinerario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a2a4a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#1a2a4a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orari & Posizioni</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Builder */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ItineraryBuilder value={itineraryState} onChange={setItineraryState} />
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Salva modifiche</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f7fa' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn:        { width: 36, alignItems: 'flex-start' },
  headerTitle:    { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  scrollContent:  { padding: 20, paddingBottom: 8 },
  footer:         { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  saveBtn:        { backgroundColor: '#1a2a4a', borderRadius: 12, padding: 15, alignItems: 'center' },
  saveBtnDisabled:{ opacity: 0.6 },
  saveBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});
