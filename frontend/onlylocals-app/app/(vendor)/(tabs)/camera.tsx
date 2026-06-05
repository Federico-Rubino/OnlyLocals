import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import {
  addPointsCard,
  getVantaggi,
  redeemCard,
  Vantaggio,
} from '../../../services/shopServices';

type ScanState = 'scanning' | 'action' | 'addPoints' | 'redeem' | 'result';

type ResultData = {
  utente: string;
  tipo: 'punti' | 'riscatto';
  puntiTotali?: number;
  puntiGuadagnati?: number;
  puntiRimanenti?: number;
  vantaggio?: Vantaggio;
};

export default function CameraScreen() {
  const { shopId } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [vantaggi, setVantaggiList] = useState<Vantaggio[]>([]);
  const [importo, setImporto] = useState('');
  const [selectedVantaggio, setSelectedVantaggio] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  // scanLock prevents a second barcode event from firing while the action sheet is already open.
  const scanLock = useRef(false);

  // Deactivate the camera when the screen loses focus to avoid background scanning.
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      return () => setCameraActive(false);
    }, [])
  );

  useEffect(() => {
    if (!shopId) return;
    getVantaggi().then(setVantaggiList).catch(() => {});
  }, [shopId]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // scanLock.current catches rapid re-fires before React re-renders and updates scanState.
    // The scanState check is a secondary guard for any event that arrives after the modal opens.
    if (scanLock.current || scanState !== 'scanning') return;
    scanLock.current = true;
    setBarcode(data);
    setScanState('action');
  };

  const reset = () => {
    setBarcode('');
    setImporto('');
    setSelectedVantaggio('');
    setResult(null);
    setScanState('scanning');
    scanLock.current = false;
  };

  const doAddPoints = async () => {
    const imp = parseFloat(importo.replace(',', '.'));
    if (!imp || imp <= 0) {
      Alert.alert('Attenzione', 'Inserisci un importo valido.');
      return;
    }
    setLoading(true);
    try {
      const data = await addPointsCard(barcode, imp);
      setResult({
        utente: data.utente,
        puntiTotali: data.puntiTotali,
        puntiGuadagnati: data.puntiGuadagnati,
        tipo: 'punti',
      });
      setScanState('result');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile aggiungere i punti');
    } finally {
      setLoading(false);
    }
  };

  const doRedeem = async () => {
    if (!selectedVantaggio) {
      Alert.alert('Attenzione', 'Seleziona un premio da riscattare.');
      return;
    }
    setLoading(true);
    try {
      const data = await redeemCard(barcode, selectedVantaggio);
      setResult({
        utente: data.utente,
        puntiRimanenti: data.puntiRimanenti,
        vantaggio: data.vantaggio,
        tipo: 'riscatto',
      });
      setScanState('result');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile riscattare il premio');
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera-outline" size={60} color="#1a2a4a" />
        <Text style={styles.permText}>
          Permesso fotocamera necessario per scansionare la fidelity card.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Consenti accesso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanState === 'scanning' ? handleBarcodeScanned : undefined}
        />
      )}

      <View style={styles.scanOverlay} pointerEvents="none">
        <View style={styles.scanFrame} />
        <Text style={styles.scanHint}>Inquadra il QR della fidelity card</Text>
      </View>

      {/* Action choice */}
      <Modal visible={scanState === 'action'} transparent animationType="slide" onRequestClose={reset}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Fidelity card rilevata</Text>
            <Text style={styles.sheetSubtitle}>Cosa vuoi fare?</Text>

            <TouchableOpacity style={styles.sheetAction} onPress={() => setScanState('addPoints')}>
              <Ionicons name="add-circle-outline" size={24} color="#1a2a4a" />
              <View>
                <Text style={styles.sheetActionLabel}>Aggiungi punti</Text>
                <Text style={styles.sheetActionSub}>Inserisci importo speso dal cliente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetAction} onPress={() => setScanState('redeem')}>
              <Ionicons name="gift-outline" size={24} color="#1a2a4a" />
              <View>
                <Text style={styles.sheetActionLabel}>Riscatta premio</Text>
                <Text style={styles.sheetActionSub}>Utilizza i punti del cliente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={reset}>
              <Text style={styles.cancelText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add points */}
      <Modal visible={scanState === 'addPoints'} transparent animationType="slide" onRequestClose={() => setScanState('action')}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Aggiungi punti</Text>
            <Text style={styles.sheetSubtitle}>Inserisci l'importo speso dal cliente</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Importo (€)</Text>
              <TextInput
                style={styles.input}
                placeholder="es. 25.50"
                value={importo}
                onChangeText={setImporto}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={doAddPoints} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Conferma in corso...' : 'Conferma'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanState('action')}>
              <Text style={styles.cancelText}>Indietro</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Redeem */}
      <Modal visible={scanState === 'redeem'} transparent animationType="slide" onRequestClose={() => setScanState('action')}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.sheetScroll} contentContainerStyle={{ padding: 22, gap: 12 }}>
            <Text style={styles.sheetTitle}>Riscatta premio</Text>
            <Text style={styles.sheetSubtitle}>Seleziona il premio da riscattare</Text>

            {vantaggi.length === 0 ? (
              <Text style={styles.emptyText}>Nessun premio configurato per questo negozio.</Text>
            ) : (
              vantaggi.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.sheetAction,
                    selectedVantaggio === v.descrizione && styles.selectedAction,
                  ]}
                  onPress={() => setSelectedVantaggio(v.descrizione)}
                >
                  <Ionicons name="gift-outline" size={20} color="#888" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetActionLabel}>{v.descrizione}</Text>
                    <Text style={styles.sheetActionSub}>Richiede {v.sogliaPunti} punti</Text>
                  </View>
                  {selectedVantaggio === v.descrizione && (
                    <Ionicons name="checkmark-circle" size={20} color="#1a2a4a" />
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, !selectedVantaggio && styles.disabledBtn]}
              onPress={doRedeem}
              disabled={loading || !selectedVantaggio}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Riscatto in corso...' : 'Riscatta'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanState('action')}>
              <Text style={styles.cancelText}>Indietro</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Result */}
      <Modal visible={scanState === 'result'} transparent animationType="fade" onRequestClose={reset}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sheet, { alignItems: 'center', gap: 10 }]}>
            <Ionicons name="checkmark-circle" size={64} color="#27ae60" />
            <Text style={styles.resultTitle}>
              {result?.tipo === 'punti' ? 'Punti aggiunti!' : 'Premio riscattato!'}
            </Text>
            <Text style={styles.resultCustomer}>{result?.utente}</Text>

            {result?.tipo === 'punti' && (
              <View style={styles.resultStatsBox}>
                {result.puntiGuadagnati !== undefined && (
                  <Text style={styles.resultStat}>+{result.puntiGuadagnati} punti guadagnati</Text>
                )}
                <Text style={styles.resultStat}>Totale: {result.puntiTotali} punti</Text>
              </View>
            )}
            {result?.tipo === 'riscatto' && (
              <View style={styles.resultStatsBox}>
                <Text style={styles.resultStat}>{result.vantaggio?.descrizione}</Text>
                <Text style={styles.resultStat}>Punti rimanenti: {result.puntiRimanenti}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 8 }]} onPress={reset}>
              <Text style={styles.primaryBtnText}>Scansiona di nuovo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#000' },
  permContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#f5f7fa', gap: 20 },
  permText:        { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 22 },
  scanOverlay:     { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame:       { width: 220, height: 220, borderWidth: 2, borderColor: '#fff', borderRadius: 16, backgroundColor: 'transparent' },
  scanHint:        { color: '#fff', fontSize: 13, marginTop: 20, textAlign: 'center', paddingHorizontal: 32 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 12 },
  sheetScroll:     { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  sheetTitle:      { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  sheetSubtitle:   { fontSize: 13, color: '#6b6b6b' },
  sheetAction:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 13, borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)' },
  selectedAction:  { borderColor: '#1a2a4a', backgroundColor: '#eef2f8' },
  sheetActionLabel:{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  sheetActionSub:  { fontSize: 12, color: '#6b6b6b', marginTop: 2 },
  emptyText:       { fontSize: 13, color: '#aaa', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  field:           { gap: 4 },
  fieldLabel:      { fontSize: 12, color: '#6b6b6b' },
  input:           { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.22)', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  primaryBtn:      { backgroundColor: '#1a2a4a', borderRadius: 10, padding: 13, alignItems: 'center' },
  disabledBtn:     { backgroundColor: '#a0a0a0' },
  primaryBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn:       { alignItems: 'center', padding: 10 },
  cancelText:      { fontSize: 14, color: '#6b6b6b' },
  resultTitle:     { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  resultCustomer:  { fontSize: 16, color: '#1a2a4a', fontWeight: '500' },
  resultStatsBox:  { backgroundColor: '#f0f4f8', borderRadius: 10, padding: 14, width: '100%', gap: 4, alignItems: 'center' },
  resultStat:      { fontSize: 14, color: '#1a1a1a' },
});
