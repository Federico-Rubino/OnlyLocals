import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

const ACCOUNT_ITEMS = [
  { label: 'Cambia password',       icon: 'lock-closed-outline', color: '#255cb3' },
  { label: 'Scarica i miei dati',   icon: 'download-outline',    color: '#255cb3' },
  { label: 'Elimina account',       icon: 'trash-outline',       color: '#e53935' }, // Nuova voce
];

const SUPPORT_ITEMS = [
  { label: 'Informazioni sull\'app', icon: 'information-circle-outline' },
];

export default function SettingsScreen() {
  const { deleteAccount, logout } = useAuth();
  const [location, setLocation] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina account',
      'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
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

      {/* Toggle section */}
      <Text style={styles.sectionTitle}>Preferenze rapide</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="location-outline" size={20} color="#255cb3" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Posizione</Text>
          </View>
          <Switch
            value={location}
            onValueChange={setLocation}
            trackColor={{ true: '#255cb3' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Account section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        {ACCOUNT_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, idx > 0 && { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}
            onPress={item.label === 'Elimina account' ? handleDeleteAccount : undefined}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon as any} size={20} color={item.color} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, item.label === 'Elimina account' && { color: '#e53935' }]}>
                {item.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Support section */}
      <Text style={styles.sectionTitle}>Supporto</Text>
      <View style={styles.card}>
        {SUPPORT_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, idx > 0 && { borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon as any} size={20} color="#255cb3" style={styles.rowIcon} />
              <Text style={styles.rowLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
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