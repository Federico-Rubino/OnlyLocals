import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { UserProfile, userService } from '../../../services/userService';

export default function ProfiloScreen() {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '', surname: '', email: '', bornDate: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
      setEditData({
        name: data.name,
        surname: data.surname,
        email: data.email,
        bornDate: data.bornDate,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace('/(auth)/login');
        return;
      }
      Alert.alert('Errore', 'Impossibile caricare il profilo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.surname.trim() || !editData.email.trim()) {
      Alert.alert('Attenzione', 'Nome, cognome ed email sono obbligatori.');
      return;
    }
    setSaving(true);
    try {
      await userService.updateProfile(editData);
      setUser(prev => prev ? { ...prev, ...editData } : prev);
      setModalVisible(false);
      Alert.alert('Successo', 'Profilo aggiornato!');
    } catch {
      Alert.alert('Errore', 'Impossibile aggiornare il profilo');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#1a2a4a" />;
  if (!user) return <Text style={styles.error}>Utente non trovato</Text>;

  const initials = `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase();
  const birthDate = user.bornDate
    ? new Date(user.bornDate).toLocaleDateString('it-IT')
    : '—';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 50, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      <Text style={styles.pageTitle}>Profilo</Text>

      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>{user.name} {user.surname}</Text>
          <Text style={styles.role}>Venditore</Text>
        </View>
        <TouchableOpacity style={styles.editIconBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="pencil-outline" size={20} color="#1a2a4a" />
        </TouchableOpacity>
      </View>

      {/* Info section */}
      <Text style={styles.sectionTitle}>Informazioni personali</Text>
      <View style={styles.card}>
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <View style={styles.rowDivider} />
        <InfoRow icon="calendar-outline" label="Data di nascita" value={birthDate} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Esci dall'account</Text>
      </TouchableOpacity>

      {/* Edit modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Modifica profilo</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={v => setEditData(p => ({ ...p, name: v }))}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Cognome</Text>
              <TextInput
                style={styles.input}
                value={editData.surname}
                onChangeText={v => setEditData(p => ({ ...p, surname: v }))}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editData.email}
                onChangeText={v => setEditData(p => ({ ...p, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data di nascita (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={editData.bornDate}
                onChangeText={v => setEditData(p => ({ ...p, bornDate: v }))}
                placeholder="es. 1990-05-21"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.primaryBtnText}>{saving ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color="#6b6b6b" style={{ marginRight: 10 }} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 16 },
  pageTitle:      { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3, marginBottom: 20 },
  error:          { flex: 1, textAlign: 'center', marginTop: 40, color: '#888' },

  headerCard:     { backgroundColor: '#1a2a4a', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText:     { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerInfo:     { flex: 1 },
  fullName:       { color: '#fff', fontSize: 17, fontWeight: '700' },
  role:           { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  editIconBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  sectionTitle:   { fontSize: 13, fontWeight: '600', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  card:           { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', paddingHorizontal: 16, marginBottom: 24 },
  infoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowDivider:     { height: 0.5, backgroundColor: 'rgba(0,0,0,0.08)', marginHorizontal: 0 },
  infoLabel:      { fontSize: 11, color: '#6b6b6b' },
  infoValue:      { fontSize: 14, color: '#1a1a1a', fontWeight: '500', marginTop: 2 },

  logoutBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(231,76,60,0.3)', padding: 16 },
  logoutText:     { fontSize: 15, fontWeight: '600', color: '#e74c3c' },

  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 12 },
  sheetTitle:     { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  field:          { gap: 4 },
  fieldLabel:     { fontSize: 12, color: '#6b6b6b' },
  input:          { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.22)', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  primaryBtn:     { backgroundColor: '#1a2a4a', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn:      { alignItems: 'center', padding: 10 },
  cancelText:     { fontSize: 14, color: '#6b6b6b' },
});
