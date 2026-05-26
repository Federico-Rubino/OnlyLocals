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
  const { logout } = useAuth();
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
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await locationPreference.set(true);
        setLocationEnabled(true);
      } else if (!canAskAgain) {
        Alert.alert(
          'Permesso negato',
          'Per abilitare la posizione vai nelle impostazioni del dispositivo.',
          [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Apri impostazioni', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      await locationPreference.set(false);
      setLocationEnabled(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const data = await userService.getMyData();
      const text = [
        'I MIEI DATI - OnlyLocals',
        '------------------------',
        `Nome: ${data.name}`,
        `Cognome: ${data.surname}`,
        `Email: ${data.email}`,
        `Data di nascita: ${new Date(data.bornDate).toLocaleDateString('it-IT')}`,
        `Ruolo: ${data.role}`,
      ].join('\n');
      await Share.share({ message: text, title: 'I miei dati OnlyLocals' });
    } catch {
      Alert.alert('Errore', 'Impossibile recuperare i tuoi dati.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina account',
      'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => Alert.alert('Funzionalità', 'Contatta il supporto per eliminare il tuo account.'),
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert('Esci', "Vuoi davvero uscire dall'account?", [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
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

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#e53935" />
        <Text style={styles.logoutText}>Esci dall'account</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  pageTitle:    { fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16, marginLeft: 4 },
  card:         { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft:      { flexDirection: 'row', alignItems: 'center' },
  rowIcon:      { marginRight: 12 },
  rowLabel:     { fontSize: 15 },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, padding: 16, backgroundColor: '#fff', borderRadius: 16, gap: 8, borderWidth: 1, borderColor: '#fcd5d5' },
  logoutText:   { color: '#e53935', fontWeight: '600', fontSize: 15 },
});
