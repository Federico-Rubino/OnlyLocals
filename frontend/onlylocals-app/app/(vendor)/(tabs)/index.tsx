import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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
import { addEvento, addPromozione, deleteEvento, deletePromozione } from '../../../services/shopServices';

const MOCK_VENDOR = {
  name: 'Cartoleria Zatti',
  description: 'La migliore cartoleria della città',
  openingHours: 'Lun-Ven: 9:00-19:00, Sab: 10:00-18:00',
};

type Promozione = { id: number; nome: string; sconto: string; };
type Evento = { id: number; titolo: string; descrizione: string; };
type BottomSheetType = 'promozioni' | 'eventi' | null;
type FormType = 'nuovaPromo' | 'eliminaPromo' | 'nuovoEvento' | 'eliminaEvento' | null;

export default function VetrinaScreen() {
  const [promozioni, setPromozioni] = useState<Promozione[]>([
    { id: 1, nome: 'Collana Hoepli', sconto: '20' },
    { id: 2, nome: 'Agende 2026', sconto: '30' },
  ]);
  const [eventi, setEventi] = useState<Evento[]>([
    { id: 1, titolo: 'Apertura straordinaria:', descrizione: 'mercoledì 29 febbraio dalle 18 alle 23' },
  ]);

  const [sheetType, setSheetType] = useState<BottomSheetType>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);

  const [promoNome, setPromoNome] = useState('');
  const [promoSconto, setPromoSconto] = useState('');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoToDelete, setPromoToDelete] = useState('');

  const [eventoTitolo, setEventoTitolo] = useState('');
  const [eventoDesc, setEventoDesc] = useState('');
  const [eventoDate, setEventoDate] = useState('');
  const [eventoToDelete, setEventoToDelete] = useState('');

  const openSheet = (type: BottomSheetType) => setSheetType(type);
  const closeSheet = () => setSheetType(null);
  const openForm = (type: FormType) => { closeSheet(); setFormType(type); };
  const closeForm = () => setFormType(null);

  const savePromozione = async () => {
    if (!promoNome.trim() || !promoSconto.trim() || !promoStartDate.trim() || !promoEndDate.trim()) {
      Alert.alert('Attenzione', 'Compila tutti i campi.');
      return;
    }
    setLoading(true);
    try {
      await addPromozione({
        description: promoNome.trim(),
        value: promoSconto.trim(),
        startDate: promoStartDate.trim(),
        endDate: promoEndDate.trim(),
      });
      setPromozioni(prev => [...prev, { id: Date.now(), nome: promoNome.trim(), sconto: promoSconto.trim() }]);
      closeForm();
      Alert.alert('Successo', 'Promozione aggiunta!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiungere la promozione');
    } finally {
      setLoading(false);
    }
  };

  const eliminaPromozione = async () => {
    if (!promoToDelete.trim()) {
      Alert.alert('Attenzione', 'Seleziona una promozione da eliminare.');
      return;
    }
    setLoading(true);
    try {
      await deletePromozione(promoToDelete.trim());
      setPromozioni(prev => prev.filter(p => p.nome !== promoToDelete));
      closeForm();
      Alert.alert('Successo', 'Promozione eliminata!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile eliminare la promozione');
    } finally {
      setLoading(false);
    }
  };

  const saveEvento = async () => {
    if (!eventoTitolo.trim() || !eventoDate.trim()) {
      Alert.alert('Attenzione', 'Compila titolo e data.');
      return;
    }
    setLoading(true);
    try {
      await addEvento({
        name: eventoTitolo.trim(),
        description: eventoDesc.trim(),
        date: eventoDate.trim(),
      });
      setEventi(prev => [...prev, { id: Date.now(), titolo: eventoTitolo.trim(), descrizione: eventoDesc.trim() }]);
      closeForm();
      Alert.alert('Successo', 'Evento aggiunto!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiungere l\'evento');
    } finally {
      setLoading(false);
    }
  };

  const eliminaEvento = async () => {
    if (!eventoToDelete.trim()) {
      Alert.alert('Attenzione', 'Seleziona un evento da eliminare.');
      return;
    }
    setLoading(true);
    try {
      await deleteEvento(eventoToDelete.trim());
      setEventi(prev => prev.filter(e => e.titolo !== eventoToDelete));
      closeForm();
      Alert.alert('Successo', 'Evento eliminato!');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile eliminare l\'evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      <Text style={styles.pageTitle}>Vetrina</Text>

      {/* Card Negozio */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{MOCK_VENDOR.name}</Text>
        <Text style={styles.cardText}>{MOCK_VENDOR.description}</Text>
        <Text style={styles.cardText}>{MOCK_VENDOR.openingHours}</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Card Promozioni */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Promozioni</Text>
        <View style={styles.promoList}>
          {promozioni.map((p) => (
            <View key={p.id} style={styles.promoRow}>
              <Text style={styles.promoNome}>{p.nome}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{p.sconto}%</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => openSheet('promozioni')}>
          <Ionicons name="pencil-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Card Eventi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Eventi</Text>
        <View style={styles.eventiList}>
          {eventi.map((e) => (
            <View key={e.id}>
              <Text style={styles.eventoTitolo}>{e.titolo}</Text>
              {!!e.descrizione && <Text style={styles.eventoDesc}>{e.descrizione}</Text>}
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => openSheet('eventi')}>
          <Ionicons name="pencil-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet: scelta azione */}
      <Modal visible={sheetType !== null} transparent animationType="slide" onRequestClose={closeSheet}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSheet}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {sheetType === 'promozioni' ? 'Promozioni' : 'Eventi'}
            </Text>

            <TouchableOpacity style={styles.sheetAction} onPress={() => openForm(sheetType === 'promozioni' ? 'nuovaPromo' : 'nuovoEvento')}>
              <Ionicons name="add-circle-outline" size={22} color="#888" />
              <View>
                <Text style={styles.sheetActionLabel}>
                  {sheetType === 'promozioni' ? 'Crea nuova promozione' : 'Crea nuovo evento'}
                </Text>
                <Text style={styles.sheetActionSub}>
                  {sheetType === 'promozioni' ? 'Aggiungi sconto a un prodotto' : 'Aggiungi un evento alla vetrina'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetAction} onPress={() => openForm(sheetType === 'promozioni' ? 'eliminaPromo' : 'eliminaEvento')}>
              <Ionicons name="trash-outline" size={22} color="#e74c3c" />
              <View>
                <Text style={[styles.sheetActionLabel, { color: '#e74c3c' }]}>
                  {sheetType === 'promozioni' ? 'Elimina promozione' : 'Elimina evento'}
                </Text>
                <Text style={styles.sheetActionSub}>Rimuovi dalla vetrina</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={closeSheet}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: nuova promozione */}
      <Modal visible={formType === 'nuovaPromo'} transparent animationType="slide" onRequestClose={closeForm}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nuova promozione</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nome prodotto</Text>
              <TextInput style={styles.input} placeholder="es. Collana Hoepli" value={promoNome} onChangeText={setPromoNome} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Sconto (%)</Text>
              <TextInput style={styles.input} placeholder="es. 20" value={promoSconto} onChangeText={setPromoSconto} keyboardType="numeric" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data inizio (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} placeholder="es. 2026-06-01" value={promoStartDate} onChangeText={setPromoStartDate} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data fine (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} placeholder="es. 2026-06-30" value={promoEndDate} onChangeText={setPromoEndDate} />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={savePromozione} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: elimina promozione */}
      <Modal visible={formType === 'eliminaPromo'} transparent animationType="slide" onRequestClose={closeForm}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeForm}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Elimina promozione</Text>
            <Text style={styles.sheetSubtitle}>Seleziona quella da eliminare</Text>
            {promozioni.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.sheetAction, promoToDelete === p.nome && styles.selectedAction]}
                onPress={() => setPromoToDelete(p.nome)}
              >
                <Ionicons name="pricetag-outline" size={20} color="#888" />
                <View>
                  <Text style={styles.sheetActionLabel}>{p.nome}</Text>
                  <Text style={styles.sheetActionSub}>{p.sconto}% di sconto</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#e74c3c' }]} onPress={eliminaPromozione} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Eliminazione...' : 'Elimina'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: nuovo evento */}
      <Modal visible={formType === 'nuovoEvento'} transparent animationType="slide" onRequestClose={closeForm}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nuovo evento</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Titolo evento</Text>
              <TextInput style={styles.input} placeholder="es. Presentazione libro" value={eventoTitolo} onChangeText={setEventoTitolo} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descrizione</Text>
              <TextInput style={[styles.input, styles.textarea]} placeholder="es. venerdì 5 giugno dalle 18 alle 21" value={eventoDesc} onChangeText={setEventoDesc} multiline numberOfLines={3} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Data (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} placeholder="es. 2026-06-05" value={eventoDate} onChangeText={setEventoDate} />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={saveEvento} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: elimina evento */}
      <Modal visible={formType === 'eliminaEvento'} transparent animationType="slide" onRequestClose={closeForm}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeForm}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Elimina evento</Text>
            <Text style={styles.sheetSubtitle}>Seleziona quello da eliminare</Text>
            {eventi.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={[styles.sheetAction, eventoToDelete === e.titolo && styles.selectedAction]}
                onPress={() => setEventoToDelete(e.titolo)}
              >
                <Ionicons name="calendar-outline" size={20} color="#888" />
                <View>
                  <Text style={styles.sheetActionLabel}>{e.titolo}</Text>
                  {!!e.descrizione && <Text style={styles.sheetActionSub}>{e.descrizione}</Text>}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#e74c3c' }]} onPress={eliminaEvento} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Eliminazione...' : 'Elimina'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  pageTitle:        { fontSize: 26, fontWeight: '700', color: '#1a2a4a', marginBottom: 20, letterSpacing: -0.3 },
  card:             { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', padding: 14, paddingRight: 48, marginBottom: 12 },
  cardTitle:        { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  cardText:         { fontSize: 13, color: '#6b6b6b', lineHeight: 19 },
  editBtn:          { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  promoList:        { marginTop: 8 },
  promoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.08)' },
  promoNome:        { fontSize: 13, color: '#1a1a1a' },
  badge:            { backgroundColor: '#e6f1fb', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  badgeText:        { fontSize: 12, fontWeight: '600', color: '#0c447c' },
  eventiList:       { marginTop: 8, gap: 8 },
  eventoTitolo:     { fontSize: 13, color: '#1a1a1a' },
  eventoDesc:       { fontSize: 12, color: '#aaaaaa', marginTop: 2 },
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 12 },
  sheetTitle:       { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  sheetSubtitle:    { fontSize: 13, color: '#6b6b6b', marginTop: -6 },
  sheetAction:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 13, borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)' },
  selectedAction:   { borderColor: '#1a2a4a', backgroundColor: '#eef2f8' },
  sheetActionLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  sheetActionSub:   { fontSize: 12, color: '#6b6b6b', marginTop: 2 },
  cancelBtn:        { alignItems: 'center', padding: 10 },
  cancelText:       { fontSize: 14, color: '#6b6b6b' },
  field:            { gap: 4 },
  fieldLabel:       { fontSize: 12, color: '#6b6b6b' },
  input:            { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.22)', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  textarea:         { minHeight: 72, textAlignVertical: 'top' },
  primaryBtn:       { backgroundColor: '#1a2a4a', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4 },
  primaryBtnText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
});