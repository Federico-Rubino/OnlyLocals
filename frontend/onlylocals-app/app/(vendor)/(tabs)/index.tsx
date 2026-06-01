import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '../../../services/notificationService';
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
  View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { addEvento, addPromozione, deleteEvento, deletePromozione, getShopById, updateShop } from '../../../services/shopServices';
import { Itinerary, DayItinerary } from '../../../types/shop';

type Promozione = { id: number; nome: string; sconto: string; };
type Evento = { id: number; titolo: string; descrizione: string; data: string; };
type BottomSheetType = 'promozioni' | 'eventi' | null;
type FormType = 'nuovaPromo' | 'eliminaPromo' | 'nuovoEvento' | 'eliminaEvento' | null;

const GIORNI: { key: keyof Itinerary; short: string }[] = [
  { key: 'lunedi',    short: 'Lun' },
  { key: 'martedi',   short: 'Mar' },
  { key: 'mercoledi', short: 'Mer' },
  { key: 'giovedi',   short: 'Gio' },
  { key: 'venerdi',   short: 'Ven' },
  { key: 'sabato',    short: 'Sab' },
  { key: 'domenica',  short: 'Dom' },
];

const SLOT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  mattina:    'sunny-outline',
  pomeriggio: 'partly-sunny-outline',
  sera:       'moon-outline',
};

function itinerarioAttivi(it: Itinerary): number {
  return GIORNI.reduce((tot, { key }) => {
    const day = it[key] as DayItinerary | undefined;
    if (!day) return tot;
    return tot + (['mattina', 'pomeriggio', 'sera'] as const).filter(s => day[s]?.location).length;
  }, 0);
}

//const SHOP_ID = '69faf4aee24aa7d93bdd3fa7';

export default function VetrinaScreen() {
 const {shopId} = useAuth();
 //const shopId = SHOP_ID;
  const [promozioni, setPromozioni] = useState<Promozione[]>([]);
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');

  const [sheetType, setSheetType] = useState<BottomSheetType>(null);
  const [formType, setFormType] = useState<FormType>(null);

  const [promoNome, setPromoNome] = useState('');
  const [promoSconto, setPromoSconto] = useState('');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoToDelete, setPromoToDelete] = useState('');

  const [eventoTitolo, setEventoTitolo] = useState('');
  const [eventoDesc, setEventoDesc] = useState('');
  const [eventoDate, setEventoDate] = useState('');
  const [eventoToDelete, setEventoToDelete] = useState('');

  const [unreadCount, setUnreadCount] = useState(0);
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const [editShopData, setEditShopData] = useState({ name: shopName, description: shopDescription });
  const [itinerario, setItinerario] = useState<Itinerary | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      if (shopId) {
        getShopById(shopId)
          .then(shop => setItinerario(shop.itinerario ?? null))
          .catch(() => {});
      }
    }, [fetchUnreadCount, shopId])
  );

     useEffect(() => {
    const loadShop = async () => {
      if (!shopId) {
        Alert.alert('Errore', 'Nessun negozio associato a questo account.');
        setLoadingData(false);
        return;
      }
      try {
        const shop = await getShopById(shopId);

        setShopName(shop.name);
        setShopDescription(shop.description);
        setEditShopData({ name: shop.name, description: shop.description }); 
        setPromozioni(shop.promotions.map((p: any, i: number) => ({
          id: i,
          nome: p.description,
          sconto: p.value,
        })));
        setEventi(shop.events.map((e: any, i: number) => ({
          id: i,
          titolo: e.name,
          descrizione: e.description,
          data: e.date ? e.date.split('T')[0] : '',
        })));
        setItinerario(shop.itinerario ?? null);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.replace('/(auth)/login');
          return;
        }
        Alert.alert('Errore', 'Impossibile caricare i dati del negozio');
      } finally {
        setLoadingData(false);
      }
    };
    loadShop();
  }, []);


 
  if (loadingData) return <ActivityIndicator style={{ flex: 1 }} />;


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

    // Valida il formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventoDate.trim())) {
      Alert.alert('Attenzione', 'Usa il formato YYYY-MM-DD (es. 2026-06-05)');
      return;
    }

    const normalizedDate = eventoDate.trim();
    const isDuplicate = eventi.some(
      e => e.descrizione === eventoDesc.trim() && e.data === normalizedDate
    );
    if (isDuplicate) {
      Alert.alert('Attenzione', 'Esiste già un evento con la stessa descrizione e data.');
      return;
    }

    setLoading(true);
    try {
      // Forza formato ISO completo
      const dataISO = `${normalizedDate}T10:00:00.000Z`;

      await addEvento({
        name: eventoTitolo.trim(),
        description: eventoDesc.trim(),
        date: dataISO,
      });
      setEventi(prev => [...prev, { id: Date.now(), titolo: eventoTitolo.trim(), descrizione: eventoDesc.trim(), data: normalizedDate }]);
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

  const saveShop = async () => {
  if (!editShopData.name.trim()) {
    Alert.alert('Attenzione', 'Il nome è obbligatorio.');
    return;
  }
  setLoading(true);
  try {
    await updateShop({
      name: editShopData.name.trim(),
      description: editShopData.description.trim(),
    });
    setShopName(editShopData.name.trim());
    setShopDescription(editShopData.description.trim());
    setShopModalVisible(false);
    Alert.alert('Successo', 'Negozio aggiornato!');
  } catch (err: any) {
    Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiornare il negozio');
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

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Vetrina</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/(vendor)/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={26} color="#1a2a4a" />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Card Negozio */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{shopName}</Text>
        <Text style={styles.cardText}>{shopDescription}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={()=>setShopModalVisible(true)}>
          <Ionicons name="pencil-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Card Itinerario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Orari & Posizioni</Text>
        {itinerario && itinerarioAttivi(itinerario) > 0 ? (
          <View style={styles.itinDaysRow}>
            {GIORNI.map(({ key, short }) => {
              const day = itinerario[key] as DayItinerary | undefined;
              const activeSlots = (['mattina', 'pomeriggio', 'sera'] as const).filter(
                s => day?.[s]?.location
              );
              return (
                <View key={key} style={[styles.itinDayChip, activeSlots.length > 0 && styles.itinDayChipActive]}>
                  <Text style={[styles.itinDayLabel, activeSlots.length > 0 && styles.itinDayLabelActive]}>
                    {short}
                  </Text>
                  {activeSlots.length > 0 && (
                    <View style={styles.itinSlotIcons}>
                      {activeSlots.map(s => (
                        <Ionicons key={s} name={SLOT_ICONS[s]} size={9} color="#fff" />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.itinEmpty}>Nessun orario impostato</Text>
        )}
        {itinerario && itinerarioAttivi(itinerario) > 0 && (
          <Text style={styles.itinCount}>
            {itinerarioAttivi(itinerario)} {itinerarioAttivi(itinerario) === 1 ? 'fascia oraria' : 'fasce orarie'} impostate
          </Text>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(vendor)/itinerario')}>
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

       {/* Modal: modifica negozio */}
      <Modal visible={shopModalVisible} transparent animationType="slide" onRequestClose={() => setShopModalVisible(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Modifica negozio</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={editShopData.name}
                onChangeText={v => setEditShopData(p => ({ ...p, name: v }))}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Descrizione</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={editShopData.description}
                onChangeText={v => setEditShopData(p => ({ ...p, description: v }))}
                multiline
                numberOfLines={3}
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={saveShop} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShopModalVisible(false)}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  titleRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle:        { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3 },
  bellBtn:          { position: 'relative', padding: 4 },
  bellBadge:        { position: 'absolute', top: 0, right: 0, backgroundColor: '#e53935', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  bellBadgeText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
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
  itinDaysRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  itinDayChip:      { width: 36, height: 40, borderRadius: 8, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center', gap: 2 },
  itinDayChipActive:{ backgroundColor: '#1a2a4a' },
  itinDayLabel:     { fontSize: 11, fontWeight: '600', color: '#9aa0a6' },
  itinDayLabelActive:{ color: '#fff' },
  itinSlotIcons:    { flexDirection: 'row', gap: 1 },
  itinEmpty:        { fontSize: 13, color: '#aaa', marginTop: 2 },
  itinCount:        { fontSize: 11, color: '#6b6b6b', marginTop: 8 },
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