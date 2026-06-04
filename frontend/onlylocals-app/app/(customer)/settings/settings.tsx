import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert, Linking, ScrollView, Share, StyleSheet,
  Switch, Text, TouchableOpacity, View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { locationPreference } from '../../../utils/locationPreference';


export default function SettingsScreen() {
  const { deleteAccount } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const pref = await locationPreference.get();
      setLocationEnabled(status === 'granted' && pref);
    })();
  }, []);

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      try {
        await Location.enableNetworkProviderAsync();
      } catch {
        // iOS non supporta enableNetworkProviderAsync, ignorato
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await locationPreference.set(true);
        setLocationEnabled(true);
      } else {
        Alert.alert(
          'Permesso necessario',
          'Per usare la posizione abilita il permesso nelle impostazioni del dispositivo.',
          [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Apri impostazioni', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      Alert.alert(
        'Disattiva posizione',
        'Come vuoi procedere?',
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Disattiva per l\'applicazione',
            onPress: async () => {
              await locationPreference.set(false);
              setLocationEnabled(false);
            },
          },
          {
            text: 'Cambia preferenze dalle impostazioni',
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  };

  const handleDownloadData = async () => {
    try {
      const [data, favorites, fidelity] = await Promise.all([
        userService.getMyData(),
        userService.getFavorites(),
        userService.getFidelityCard().catch(() => null),
      ]);
      const favoritesLine = favorites.length > 0
        ? favorites.map(s => `  - ${s.name} (${s.category})`).join('\n')
        : '  Nessun negozio salvato';
      const fidelityLines = fidelity && fidelity.shops.length > 0
        ? [`  Barcode: ${fidelity.barcode}`, ...fidelity.shops.map(s => `  - ${s.shopName}: ${s.punti} punti`)].join('\n')
        : '  Nessun punto accumulato';
      const text = [
        'I MIEI DATI - OnlyLocals',
        '------------------------',
        `Nome: ${data.name}`,
        `Cognome: ${data.surname}`,
        `Email: ${data.email}`,
        `Data di nascita: ${new Date(data.bornDate).toLocaleDateString('it-IT')}`,
        `Ruolo: ${data.role}`,
        '',
        'Negozi preferiti:',
        favoritesLine,
        '',
        'Punti fedeltà:',
        fidelityLines,
      ].join('\n');
      await Share.share({ message: text, title: 'I miei dati OnlyLocals' });
    } catch {
      Alert.alert('Errore', 'Impossibile recuperare i tuoi dati.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina account',
      'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e tutti i tuoi dati verranno cancellati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (err: any) {
              console.log('deleteAccount error:', JSON.stringify(err?.response?.data), err?.response?.status, err?.message);
              Alert.alert('Errore', "Impossibile eliminare l'account. Riprova più tardi.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Impostazioni</Text>

      <Text style={styles.sectionTitle}>Preferenze rapide</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="location-outline" size={20} color="#255cb3" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Posizione</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={handleLocationToggle}
            trackColor={{ true: '#255cb3' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={handleDownloadData}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="download-outline" size={20} color="#255cb3" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Scarica i miei dati</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="trash-outline" size={20} color="#e53935" style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: '#e53935' }]}>Elimina account</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: '#1a2a4a', marginBottom: 20, marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16, marginLeft: 4 },
  card:         { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft:      { flexDirection: 'row', alignItems: 'center' },
  rowIcon:      { marginRight: 12 },
  rowLabel:     { fontSize: 15 },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, padding: 16, backgroundColor: '#fff', borderRadius: 16, gap: 8, borderWidth: 1, borderColor: '#fcd5d5' },
  logoutText:   { color: '#e53935', fontWeight: '600', fontSize: 15 },
});
