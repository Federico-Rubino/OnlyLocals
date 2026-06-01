import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 30-minute time options from 00:00 to 23:30.
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

interface Props {
  visible: boolean;
  dayLabel: string;
  slotLabel: string;
  oraInizio: string;
  oraFine: string;
  onClose: () => void;
  onConfirm: (oraInizio: string, oraFine: string) => void;
}

export default function TimeRangePickerModal({
  visible, dayLabel, slotLabel, oraInizio, oraFine, onClose, onConfirm,
}: Props) {
  const [start, setStart] = useState(oraInizio);
  const [end, setEnd] = useState(oraFine);

  useEffect(() => {
    if (visible) {
      setStart(oraInizio);
      setEnd(oraFine);
    }
  }, [visible, oraInizio, oraFine]);

  const invalid = toMinutes(end) <= toMinutes(start);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Orario di apertura</Text>
          <Text style={styles.subtitle}>{dayLabel} · {slotLabel}</Text>

          <View style={styles.pickersRow}>
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Dalle</Text>
              <Picker
                selectedValue={start}
                onValueChange={(v) => setStart(String(v))}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {TIME_OPTIONS.map(t => <Picker.Item key={t} label={t} value={t} />)}
              </Picker>
            </View>

            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Alle</Text>
              <Picker
                selectedValue={end}
                onValueChange={(v) => setEnd(String(v))}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {TIME_OPTIONS.map(t => <Picker.Item key={t} label={t} value={t} />)}
              </Picker>
            </View>
          </View>

          {invalid && (
            <Text style={styles.error}>L&apos;orario di chiusura deve essere successivo all&apos;apertura.</Text>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, invalid && styles.confirmBtnDisabled]}
            onPress={() => onConfirm(start, end)}
            disabled={invalid}
          >
            <Text style={styles.confirmText}>Conferma orario</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1a2a4a', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#2e7d32', fontWeight: '600', textAlign: 'center', marginTop: 2, marginBottom: 8 },
  pickersRow: { flexDirection: 'row', gap: 16 },
  pickerCol: { flex: 1 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'center', marginBottom: Platform.OS === 'ios' ? 0 : 6 },
  picker: { width: '100%' },
  pickerItem: { fontSize: 20, height: 150 },
  error: { fontSize: 12, color: '#c0392b', textAlign: 'center', marginTop: 8 },
  confirmBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
