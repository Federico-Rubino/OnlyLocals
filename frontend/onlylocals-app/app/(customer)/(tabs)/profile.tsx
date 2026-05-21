import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { UserProfile, userService } from '../../../services/userService';


 const SETTINGS = [
    { id: 1, label: 'settings',     icon: 'settings-outline', route: '/settings/settings' },
    { id: 2, label: 'appearance',   icon: 'moon-outline',     route: '/settings/appearance' },  ];

export default function ProfileScreen() {
 
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    name: '', surname: '', email: '', bornDate: ''
  });



  const loadProfile = useCallback(async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
      setEditData({
        name: data.name,
        surname: data.surname,
        email: data.email,
        bornDate: data.bornDate
      });
    } catch (err: any) {
      //se non auth redirect to login page
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
  }, []);

  const handleSave = async () => {
    try {
      await userService.updateProfile(editData);
      setUser(prev => prev ? { ...prev, ...editData } : prev);
      setModalVisible(false);
      Alert.alert('Successo', 'Profilo aggiornato!');
    } catch (err) {
      Alert.alert('Errore', 'Impossibile aggiornare il profilo');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!user) return <Text style={styles.error}>Utente non trovato</Text>;

  const birthDate = new Date(user.bornDate).toLocaleDateString('it-IT');

  return (
    <ScrollView style={styles.container}
    contentContainerStyle={{paddingTop: 50}}>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color="#fff" />
        </View>
        <Text style={styles.name}>{user.name} {user.surname}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="pencil-outline" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Informazioni profilo:</Text>
      <Text style={styles.info}><Text style={styles.bold}>E-mail: </Text>{user.email}</Text>
      <Text style={styles.info}><Text style={styles.bold}>Data di nascita: </Text>{birthDate}</Text>

      <View style={styles.divider} />

      {SETTINGS.map((item) => (
        <TouchableOpacity key={item.id} style={styles.row}
        onPress={() => item.route && router.push(item.route as any)}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Ionicons name={item.icon as any} size={22} color="#333" />
        </TouchableOpacity>
      ))}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>Modifica profilo</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={editData.name}
              onChangeText={v => setEditData(p => ({ ...p, name: v }))}
            />

            <Text style={styles.label}>Cognome</Text>
            <TextInput
              style={styles.input}
              value={editData.surname}
              onChangeText={v => setEditData(p => ({ ...p, surname: v }))}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={editData.email}
              onChangeText={v => setEditData(p => ({ ...p, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Data di nascita</Text>
            <TextInput
              style={styles.input}
              value={editData.bornDate}
              onChangeText={v => setEditData(p => ({ ...p, bornDate: v }))}
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Salva</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#b8c9e0', borderRadius: 16, padding: 16, marginBottom: 20 },
  avatar:         { width: 52, height: 52, borderRadius: 26, backgroundColor: '#7a9cbf', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  name:           { flex: 1, fontSize: 18, fontWeight: 'bold' },
  sectionTitle:   { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  info:           { fontSize: 14, marginBottom: 2 },
  bold:           { fontWeight: 'bold' },
  divider:        { height: 1, backgroundColor: '#ddd', marginVertical: 16 },
  row:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 4 },
  rowLabel:       { fontSize: 15 },
  error:          { flex: 1, textAlign: 'center', marginTop: 40 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle:     { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label:          { fontSize: 13, color: '#555', marginBottom: 4 },
  input:          { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 },
  modalButtons:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalBtn:       { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn:      { backgroundColor: '#f0f0f0', marginRight: 8 },
  saveBtn:        { backgroundColor: '#255cb3', marginLeft: 8 },
  cancelText:     { color: '#333', fontWeight: 'bold' },
  saveText:       { color: '#fff', fontWeight: 'bold' },
});