import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
import {
  getShopById,
  getVantaggi,
  modifyConversion,
  setVantaggi,
  Vantaggio,
} from '../../../services/shopServices';

type FidelityManager = {
  modo: 'visita' | 'acquisto';
  tassoConversione?: number;
  ultimaModifica?: string;
};

export default function FidelityScreen() {
  const { shopId } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fidelityManager, setFidelityManager] = useState<FidelityManager | null>(null);
  const [vantaggi, setVantaggiState] = useState<Vantaggio[]>([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVantaggi, setEditVantaggi] = useState<Vantaggio[]>([]);

  const [tassoModalVisible, setTassoModalVisible] = useState(false);
  const [tassoInput, setTassoInput] = useState('');

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoadingData(true);
    try {
      const [shop, v] = await Promise.all([getShopById(shopId), getVantaggi()]);
      const mgr = (shop as any).fidelityCardManager as FidelityManager | undefined;
      setFidelityManager(mgr ?? null);
      setVantaggiState(v);
    } catch {
      Alert.alert('Errore', 'Impossibile caricare i dati della fidelity card');
    } finally {
      setLoadingData(false);
    }
  }, [shopId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openEditVantaggi = () => {
    setEditVantaggi(vantaggi.map(v => ({ ...v })));
    setEditModalVisible(true);
  };

  const addVantaggio = () => {
    setEditVantaggi(prev => [...prev, { descrizione: '', valore: 0, sogliaPunti: 0 }]);
  };

  const removeVantaggio = (index: number) => {
    setEditVantaggi(prev => prev.filter((_, i) => i !== index));
  };

  const updateVantaggio = (index: number, field: keyof Vantaggio, value: string) => {
    setEditVantaggi(prev =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === 'descrizione') return { ...v, descrizione: value };
        return { ...v, [field]: Number(value) || 0 };
      })
    );
  };

  const saveVantaggi = async () => {
    const valid = editVantaggi.every(v => v.descrizione.trim() && v.sogliaPunti > 0);
    if (!valid) {
      Alert.alert('Attenzione', 'Compila descrizione e soglia punti per ogni premio.');
      return;
    }
    setLoading(true);
    try {
      await setVantaggi(editVantaggi);
      setVantaggiState(editVantaggi);
      setEditModalVisible(false);
      Alert.alert('Successo', 'Premi aggiornati!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiornare i premi');
    } finally {
      setLoading(false);
    }
  };

  const openEditTasso = () => {
    setTassoInput(String(fidelityManager?.tassoConversione ?? ''));
    setTassoModalVisible(true);
  };

  const saveTasso = async () => {
    const t = Number(tassoInput);
    if (!t || t <= 0) {
      Alert.alert('Attenzione', 'Inserisci un valore valido maggiore di 0.');
      return;
    }
    setLoading(true);
    try {
      await modifyConversion(t);
      setFidelityManager(prev => (prev ? { ...prev, tassoConversione: t } : prev));
      setTassoModalVisible(false);
      Alert.alert('Successo', 'Tasso di conversione aggiornato!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiornare il tasso');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <ActivityIndicator style={{ flex: 1 }} />;

  const isAcquisto = fidelityManager?.modo === 'acquisto';
  const canEditNote = fidelityManager?.ultimaModifica
    ? `Ultima modifica: ${new Date(fidelityManager.ultimaModifica).toLocaleDateString('it-IT')}. Modificabile ogni 3 mesi.`
    : 'I premi possono essere modificati ogni 3 mesi.';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 50, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      <Text style={styles.pageTitle}>Fidelity Card</Text>

      {/* Modalità */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Modalità raccolta punti</Text>
        <View style={styles.modeRow}>
          <Ionicons
            name={isAcquisto ? 'card-outline' : 'footsteps-outline'}
            size={20}
            color="#1a2a4a"
          />
          <Text style={styles.modeText}>
            {isAcquisto ? 'Acquisto — punti per importo speso' : 'Visita — 1 punto per visita'}
          </Text>
        </View>
        {isAcquisto && (
          <View style={styles.tassoRow}>
            <Text style={styles.tassoLabel}>
              Tasso:{' '}
              <Text style={styles.tassoValue}>
                {fidelityManager?.tassoConversione ?? '—'} €
              </Text>{' '}
              = 1 punto
            </Text>
            <TouchableOpacity style={styles.inlineEditBtn} onPress={openEditTasso}>
              <Ionicons name="pencil-outline" size={16} color="#888" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Premi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premi disponibili</Text>
        <Text style={styles.noteText}>{canEditNote}</Text>
        {vantaggi.length === 0 ? (
          <Text style={styles.emptyText}>Nessun premio configurato</Text>
        ) : (
          <View style={styles.vantaggiList}>
            {vantaggi.map((v, i) => (
              <View key={i} style={styles.vantaggioRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vantaggioDesc}>{v.descrizione}</Text>
                  <Text style={styles.vantaggioMeta}>Valore: {v.valore}</Text>
                </View>
                <View style={styles.puntiBadge}>
                  <Text style={styles.puntiBadgeText}>{v.sogliaPunti} pt</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={openEditVantaggi}>
          <Ionicons name="pencil-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Modal: modifica premi */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={{ padding: 22, gap: 14 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sheetTitle}>Modifica premi</Text>
            <Text style={styles.sheetSubtitle}>{canEditNote}</Text>

            {editVantaggi.map((v, i) => (
              <View key={i} style={styles.vantaggioEditCard}>
                <View style={styles.vantaggioEditHeader}>
                  <Text style={styles.vantaggioEditNum}>Premio {i + 1}</Text>
                  <TouchableOpacity onPress={() => removeVantaggio(i)}>
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Descrizione</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="es. Sconto 10%"
                    value={v.descrizione}
                    onChangeText={val => updateVantaggio(i, 'descrizione', val)}
                  />
                </View>
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Valore</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="es. 10"
                      value={v.valore === 0 ? '' : String(v.valore)}
                      onChangeText={val => updateVantaggio(i, 'valore', val)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Soglia punti</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="es. 5"
                      value={v.sogliaPunti === 0 ? '' : String(v.sogliaPunti)}
                      onChangeText={val => updateVantaggio(i, 'sogliaPunti', val)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={addVantaggio}>
              <Ionicons name="add-circle-outline" size={20} color="#1a2a4a" />
              <Text style={styles.addBtnText}>Aggiungi premio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={saveVantaggi} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: modifica tasso */}
      <Modal
        visible={tassoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTassoModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Tasso di conversione</Text>
            <Text style={styles.sheetSubtitle}>Quanti euro corrispondono a 1 punto?</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Euro per punto</Text>
              <TextInput
                style={styles.input}
                placeholder="es. 10"
                value={tassoInput}
                onChangeText={setTassoInput}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={saveTasso} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTassoModalVisible(false)}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  pageTitle:           { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3, marginBottom: 20 },
  card:                { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', padding: 14, paddingRight: 48, marginBottom: 12 },
  cardTitle:           { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  modeRow:             { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeText:            { fontSize: 14, color: '#1a2a4a', fontWeight: '500' },
  tassoRow:            { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  tassoLabel:          { fontSize: 13, color: '#6b6b6b' },
  tassoValue:          { fontWeight: '600', color: '#1a2a4a' },
  inlineEditBtn:       { padding: 4 },
  noteText:            { fontSize: 12, color: '#aaa', marginBottom: 10 },
  emptyText:           { fontSize: 13, color: '#aaa', fontStyle: 'italic' },
  vantaggiList:        { gap: 8 },
  vantaggioRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.07)' },
  vantaggioDesc:       { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  vantaggioMeta:       { fontSize: 12, color: '#6b6b6b', marginTop: 2 },
  puntiBadge:          { backgroundColor: '#e6f1fb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  puntiBadgeText:      { fontSize: 12, fontWeight: '700', color: '#0c447c' },
  editBtn:             { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  overlay:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet:               { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 12 },
  sheetScroll:         { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  sheetTitle:          { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  sheetSubtitle:       { fontSize: 13, color: '#6b6b6b' },
  vantaggioEditCard:   { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)', borderRadius: 12, padding: 12, gap: 10 },
  vantaggioEditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vantaggioEditNum:    { fontSize: 13, fontWeight: '600', color: '#1a2a4a' },
  fieldRow:            { flexDirection: 'row', gap: 10 },
  field:               { gap: 4 },
  fieldLabel:          { fontSize: 12, color: '#6b6b6b' },
  input:               { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.22)', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  addBtn:              { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1a2a4a', borderStyle: 'dashed', justifyContent: 'center' },
  addBtnText:          { fontSize: 14, fontWeight: '600', color: '#1a2a4a' },
  primaryBtn:          { backgroundColor: '#1a2a4a', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4 },
  primaryBtnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn:           { alignItems: 'center', padding: 10 },
  cancelText:          { fontSize: 14, color: '#6b6b6b' },
});
