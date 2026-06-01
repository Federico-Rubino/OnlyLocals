import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Logger } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Keyboard, Modal, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';

Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

// Suppress the non-fatal native race: ViewTagResolver fires when the map view
// is released by RN while Mapbox still holds its tag internally (modal close timing).
Logger.setLogCallback(log => {
  if (log.message?.match(/ViewTagResolver|view: \d+ but is null/)) return true;
  return false;
});

const MILAN_CENTER: [number, number] = [9.1900, 45.4642];

export interface PickedCoordinates {
  latitudine: number;
  longitudine: number;
  indirizzo: string;
}

interface Props {
  visible: boolean;
  initialCoordinate?: [number, number] | null; // [lng, lat]
  dayLabel: string;
  slotLabel: string;
  onClose: () => void;
  onConfirm: (loc: PickedCoordinates) => void;
}

export default function LocationPickerModal({
  visible, initialCoordinate, dayLabel, slotLabel, onClose, onConfirm,
}: Props) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const centerRef = useRef<[number, number]>(initialCoordinate ?? MILAN_CENTER);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingInitRef = useRef<[number, number] | null>(null);

  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!visible) {
      pendingInitRef.current = null;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    setQuery('');
    setSearchError('');
    const init = initialCoordinate ?? MILAN_CENTER;
    centerRef.current = init;
    pendingInitRef.current = init;
    reverseGeocode(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleMapReady = () => {
    if (!pendingInitRef.current) return;
    cameraRef.current?.setCamera({
      centerCoordinate: pendingInitRef.current,
      zoomLevel: 15,
      animationMode: 'none',
      animationDuration: 0,
    });
    pendingInitRef.current = null;
  };

  const reverseGeocode = async (coord: [number, number]): Promise<string> => {
    const [lng, lat] = coord;
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setResolving(true);
    let label = fallback;
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const r = results[0];
      if (r) {
        const street = [r.street, r.streetNumber].filter(Boolean).join(' ');
        const parts = [street, r.city || r.subregion, r.postalCode].filter(Boolean);
        label = parts.join(', ') || fallback;
      }
    } catch {
      label = fallback;
    }
    setAddress(label);
    setResolving(false);
    return label;
  };

  const handleCameraChanged = (state: any) => {
    const center = state?.properties?.center;
    if (!center || center.length !== 2) return;
    centerRef.current = [center[0], center[1]];
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reverseGeocode(centerRef.current), 450);
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    Keyboard.dismiss();
    setSearching(true);
    setSearchError('');
    try {
      const results = await Location.geocodeAsync(q);
      if (!results.length) {
        setSearchError('Indirizzo non trovato. Prova a essere più specifico.');
        return;
      }
      const { latitude, longitude } = results[0];
      const coord: [number, number] = [longitude, latitude];
      centerRef.current = coord;
      cameraRef.current?.setCamera({
        centerCoordinate: coord,
        zoomLevel: 16,
        animationMode: 'flyTo',
        animationDuration: 800,
      });
      reverseGeocode(coord);
    } catch {
      setSearchError('Ricerca non riuscita. Riprova.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coord: [number, number] = [loc.coords.longitude, loc.coords.latitude];
    centerRef.current = coord;
    cameraRef.current?.setCamera({
      centerCoordinate: coord,
      zoomLevel: 16,
      animationMode: 'flyTo',
      animationDuration: 800,
    });
    reverseGeocode(coord);
  };

  const handleConfirm = async () => {
    setSaving(true);
    const label = await reverseGeocode(centerRef.current);
    const [lng, lat] = centerRef.current;
    setSaving(false);
    onConfirm({ latitudine: lat, longitudine: lng, indirizzo: label });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
          onCameraChanged={handleCameraChanged}
          onDidFinishLoadingMap={handleMapReady}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={15}
            centerCoordinate={initialCoordinate ?? MILAN_CENTER}
          />
        </Mapbox.MapView>

        {/* Fixed center pin — the tip points to the exact map center */}
        <View pointerEvents="none" style={styles.pinOverlay}>
          <Ionicons name="location-sharp" size={46} color="#2e7d32" style={styles.pinIcon} />
          <View style={styles.pinDot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#1a2a4a" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerDay}>{dayLabel}</Text>
            <Text style={styles.headerSlot}>{slotLabel}</Text>
          </View>
        </View>

        {/* Address search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9aa0a6" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={t => { setQuery(t); if (searchError) setSearchError(''); }}
              placeholder="Cerca un indirizzo o una città"
              placeholderTextColor="#9aa0a6"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCorrect={false}
            />
            {searching ? (
              <ActivityIndicator size="small" color="#2e7d32" />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={handleSearch} hitSlop={8}>
                <Ionicons name="arrow-forward-circle" size={24} color="#2e7d32" />
              </TouchableOpacity>
            ) : null}
          </View>
          {searchError ? <Text style={styles.searchError}>{searchError}</Text> : null}
        </View>

        {/* "Use my location" floating button */}
        <TouchableOpacity style={styles.gpsBtn} onPress={handleUseMyLocation}>
          <Ionicons name="locate" size={22} color="#2e7d32" />
        </TouchableOpacity>

        {/* Bottom card */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomLabel}>Trascina la mappa per posizionare il pin</Text>
          <View style={styles.addressRow}>
            <Ionicons name="navigate-circle-outline" size={20} color="#2e7d32" />
            {resolving ? (
              <ActivityIndicator size="small" color="#888" style={styles.addressSpinner} />
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.confirmBtn, saving && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Conferma posizione</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    marginBottom: 22, // lift so the tip sits on the exact center
  },
  pinDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(46,125,50,0.35)',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerTextWrap: {
    marginLeft: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerDay: { fontSize: 15, fontWeight: '700', color: '#1a2a4a' },
  headerSlot: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
  searchWrap: {
    position: 'absolute',
    top: 104,
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a2a4a',
  },
  searchError: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: '#c0392b',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  gpsBtn: {
    position: 'absolute',
    right: 16,
    bottom: 210,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f6f4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    minHeight: 52,
  },
  addressSpinner: { marginLeft: 10 },
  addressText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  confirmBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
