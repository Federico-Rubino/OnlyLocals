import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SearchBar from '../../../components/SearchBar';
import FilterBar from '../../../components/FilterBar';
import ShopResultsList from '../../../components/ShopResultsList';
import { SearchResult } from '../../../services/searchService';
import { getCurrentDayKey, getCurrentSlotKey } from '../../../utils/getCurrentSlot';

Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

const MILAN_CENTER: [number, number] = [9.1900, 45.4642];

const extractCurrentMarker = (
  shop: SearchResult
): { id: string; coordinate: [number, number]; label: string } | null => {
  const day = getCurrentDayKey();
  const slot = getCurrentSlotKey();

  const slotData = shop.itinerario[day]?.[slot];
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
    // TODO: navigate to shop detail screen
    console.log('Navigate to shop:', shop._id);
  };

  const handleClear = () => {
    setActiveResults([]);
    setShowBottomSheet(false);
    cameraRef.current?.setCamera({
      centerCoordinate: userCoordinate ?? MILAN_CENTER,
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
            centerCoordinate={MILAN_CENTER}
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