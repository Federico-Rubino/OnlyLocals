import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import SearchBar, { SearchTrigger } from '../../../components/SearchBar';
import FilterBar from '../../../components/FilterBar';
import ShopResultsList from '../../../components/ShopResultsList';
import { SearchResult } from '../../../services/searchService';
import { userService } from '../../../services/userServices';
import { getCurrentDayKey, getCurrentSlotKey } from '../../../utils/getCurrentSlot';

Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

const TRENTO_CENTER: [number, number] = [11.1217, 46.0748];


const extractCurrentMarker = (
  shop: SearchResult
): { id: string; coordinate: [number, number]; label: string } | null => {
  const day = getCurrentDayKey();
  const slot = getCurrentSlotKey();

  const slotData = shop.itinerario?.[day]?.[slot];
  if (!slotData) return null; // shop not active right now

  let lng: number | undefined;
  let lat: number | undefined;

  if (slotData.location.coordinates.length === 2) {
    [lng, lat] = slotData.location.coordinates;
  } else if (slotData.latitudine != null && slotData.longitudine != null) {
    lat = slotData.latitudine;
    lng = slotData.longitudine;
  }

  if (lng == null || lat == null) return null;

  return {
    id: shop._id,
    coordinate: [lng, lat],
    label: `${shop.name} – ${slotData.indirizzo}`,
  };
};

const HomeScreen = () => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [activeResults, setActiveResults] = useState<SearchResult[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [userCoordinate, setUserCoordinate] = useState<[number, number] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTrigger, setSearchTrigger] = useState<SearchTrigger | null>(null);

  const router = useRouter();
  const { q, cats, ts } = useLocalSearchParams<{ q?: string; cats?: string; ts?: string }>();

  // Fire a search when we arrive here from a saved-search tap
  useEffect(() => {
    if (!ts) return;
    setSearchTrigger({
      query: q ?? '',
      categories: cats ? cats.split('|').filter(Boolean) : [],
      ts: Number(ts),
    });
  }, [ts]);
  // Request location permission and fly to user position on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinate: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setUserCoordinate(coordinate);
      cameraRef.current?.setCamera({
        centerCoordinate: coordinate,
        zoomLevel: 14,
        animationMode: 'flyTo',
        animationDuration: 1200,
      });
    })();
  }, []);

  // Compute all markers from current results
  const allMarkers = activeResults
  .map(extractCurrentMarker)
  .filter((m): m is NonNullable<typeof m> => m !== null);

  const handleResultsFound = (results: SearchResult[]) => {
  setActiveResults(results);
  setShowBottomSheet(results.length > 0);

  // Fly to the first shop that is active right now
  const firstMarker = results
    .map(extractCurrentMarker)
    .find((m) => m !== null);

  if (firstMarker) {
    cameraRef.current?.setCamera({
      centerCoordinate: firstMarker.coordinate,
      zoomLevel: 13,
      animationMode: 'flyTo',
      animationDuration: 800,
    });
  }
};

  const handleShopPress = (shop: SearchResult) => {
    router.push(`../../shop/${shop._id}`);
    console.log('Navigate to shop:', shop._id);
  };

  const handleClear = () => {
    setActiveResults([]);
    setShowBottomSheet(false);
    cameraRef.current?.setCamera({
      centerCoordinate: userCoordinate ?? TRENTO_CENTER,
      zoomLevel: 14,
      animationMode: 'flyTo',
      animationDuration: 600,
    });
  };

  const handleCategoryToggle = async (categories: string[]) => {
    setSelectedCategories(categories);

    // API Call Example:
    // const results = await searchService.fetchByFilters({ categories });
    // handleResultsFound(results);
  };

  const handleSaveSearch = async (name: string, categories: string[]) => {
    try {
      await userService.saveSearch(name || undefined, categories.length > 0 ? categories : undefined);
      Alert.alert('Ricerca salvata', 'Puoi trovarla nella sezione Preferiti > Ricerche.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        Alert.alert('Già salvata', 'Questa ricerca è già nei tuoi preferiti.');
      } else if (status === 401 || status === 403) {
        Alert.alert('Accesso richiesto', 'Devi essere loggato per salvare una ricerca.');
      } else {
        Alert.alert('Errore', 'Impossibile salvare la ricerca.');
      }
    }
  };
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          logoEnabled={false}
          attributionEnabled={true}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={TRENTO_CENTER}
            animationMode="flyTo"
            animationDuration={2000}
          />

          {/* Blue pulsing dot for the user's current position */}
          <Mapbox.UserLocation
            visible={true}
            animated={true}
          />

          {/* Render a marker for every valid time-slot coordinate */}
          {allMarkers.map((marker) => (
            <Mapbox.PointAnnotation
              key={marker.id}
              id={marker.id}
              coordinate={marker.coordinate}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerCore} />
              </View>
              <Mapbox.Callout title={marker.label} />
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>

        {/* Floating search bar + suggestions dropdown */}
          <SearchBar
            onResultsFound={handleResultsFound}
            onClear={handleClear}
            onSaveSearch={handleSaveSearch}
            searchTrigger={searchTrigger}
          />
          
        {/* Bottom sheet with results list */}
        {showBottomSheet && (
          <ShopResultsList
            results={activeResults}
            onShopPress={handleShopPress}
            onClose={() => setShowBottomSheet(false)}
          />
        )}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchCompositeContainer: {
    position: 'absolute',
    top: 50, // Adjust based on status bar height
    left: 0,
    right: 0,
    zIndex: 10,
  },
  markerContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 15,
  },
  markerCore: {
    height: 16,
    width: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
});