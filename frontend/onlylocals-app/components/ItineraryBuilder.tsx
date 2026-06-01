import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LocationPickerModal, { PickedLocation } from './LocationPickerModal';

export type DayKey =
  | 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica';
export type SlotKey = 'mattina' | 'pomeriggio' | 'sera';

export type ItineraryState = {
  [day in DayKey]?: {
    [slot in SlotKey]?: PickedLocation;
  };
};

const DAYS: { key: DayKey; short: string; label: string }[] = [
  { key: 'lunedi', short: 'Lun', label: 'Lunedì' },
  { key: 'martedi', short: 'Mar', label: 'Martedì' },
  { key: 'mercoledi', short: 'Mer', label: 'Mercoledì' },
  { key: 'giovedi', short: 'Gio', label: 'Giovedì' },
  { key: 'venerdi', short: 'Ven', label: 'Venerdì' },
  { key: 'sabato', short: 'Sab', label: 'Sabato' },
  { key: 'domenica', short: 'Dom', label: 'Domenica' },
];

const SLOTS: { key: SlotKey; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'mattina', label: 'Mattina', sub: '06:00 – 12:00', icon: 'sunny-outline' },
  { key: 'pomeriggio', label: 'Pomeriggio', sub: '12:00 – 18:00', icon: 'partly-sunny-outline' },
  { key: 'sera', label: 'Sera', sub: '18:00 – 24:00', icon: 'moon-outline' },
];

interface Props {
  value: ItineraryState;
  onChange: (next: ItineraryState) => void;
}

export function countSlots(state: ItineraryState): number {
  return Object.values(state).reduce(
    (acc, slots) => acc + Object.values(slots ?? {}).filter(Boolean).length,
    0,
  );
}

export default function ItineraryBuilder({ value, onChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<DayKey>('lunedi');
  const [editing, setEditing] = useState<{ day: DayKey; slot: SlotKey } | null>(null);

  const dayHasSlots = (day: DayKey) =>
    Object.values(value[day] ?? {}).some(Boolean);

  const setSlot = (day: DayKey, slot: SlotKey, loc: PickedLocation | null) => {
    const nextDay = { ...(value[day] ?? {}) };
    if (loc) nextDay[slot] = loc;
    else delete nextDay[slot];
    const next = { ...value, [day]: nextDay };
    if (!Object.values(nextDay).some(Boolean)) delete next[day];
    onChange(next);
  };

  const total = countSlots(value);
  const editingLoc = editing ? value[editing.day]?.[editing.slot] : undefined;
  const dayMeta = DAYS.find(d => d.key === editing?.day);
  const slotMeta = SLOTS.find(s => s.key === editing?.slot);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Il tuo itinerario</Text>
      <Text style={styles.subtitle}>
        Indica dove sarai durante la settimana. Tocca una fascia oraria per impostare il luogo sulla mappa.
      </Text>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysRow}
      >
        {DAYS.map(d => {
          const active = d.key === selectedDay;
          return (
            <TouchableOpacity
              key={d.key}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => setSelectedDay(d.key)}
            >
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                {d.short}
              </Text>
              {dayHasSlots(d.key) && (
                <View style={[styles.dayDot, active && styles.dayDotActive]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slot cards for selected day */}
      <View style={styles.slotsWrap}>
        {SLOTS.map(s => {
          const loc = value[selectedDay]?.[s.key];
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.slotCard, loc && styles.slotCardSet]}
              activeOpacity={0.8}
              onPress={() => setEditing({ day: selectedDay, slot: s.key })}
            >
              <View style={[styles.slotIcon, loc && styles.slotIconSet]}>
                <Ionicons name={s.icon} size={22} color={loc ? '#2e7d32' : '#9aa0a6'} />
              </View>
              <View style={styles.slotBody}>
                <Text style={styles.slotLabel}>{s.label}</Text>
                {loc ? (
                  <Text style={styles.slotAddress} numberOfLines={1}>{loc.indirizzo}</Text>
                ) : (
                  <Text style={styles.slotSub}>{s.sub} · Tocca per impostare</Text>
                )}
              </View>
              {loc ? (
                <TouchableOpacity
                  hitSlop={10}
                  onPress={() => setSlot(selectedDay, s.key, null)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#c0392b" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="add-circle" size={26} color="#2e7d32" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Ionicons
          name={total > 0 ? 'checkmark-circle' : 'information-circle-outline'}
          size={18}
          color={total > 0 ? '#2e7d32' : '#9aa0a6'}
        />
        <Text style={styles.summaryText}>
          {total > 0
            ? `${total} ${total === 1 ? 'fascia oraria impostata' : 'fasce orarie impostate'}`
            : 'Imposta almeno una fascia oraria'}
        </Text>
      </View>

      <LocationPickerModal
        visible={editing !== null}
        initialCoordinate={
          editingLoc ? [editingLoc.longitudine, editingLoc.latitudine] : null
        }
        dayLabel={dayMeta?.label ?? ''}
        slotLabel={slotMeta?.label ?? ''}
        onClose={() => setEditing(null)}
        onConfirm={(loc) => {
          if (editing) setSlot(editing.day, editing.slot, loc);
          setEditing(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a2a4a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 24, lineHeight: 21 },
  daysRow: { gap: 10, paddingVertical: 4, paddingRight: 8 },
  dayChip: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e6ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  dayChipText: { fontSize: 14, fontWeight: '700', color: '#555' },
  dayChipTextActive: { color: '#fff' },
  dayDot: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2e7d32',
  },
  dayDotActive: { backgroundColor: '#fff' },
  slotsWrap: { marginTop: 24, gap: 12 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3e6ea',
  },
  slotCardSet: { borderColor: '#2e7d32', backgroundColor: '#f5faf6' },
  slotIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconSet: { backgroundColor: '#e3f1e5' },
  slotBody: { flex: 1, marginLeft: 14 },
  slotLabel: { fontSize: 16, fontWeight: '700', color: '#1a2a4a' },
  slotSub: { fontSize: 12, color: '#9aa0a6', marginTop: 2 },
  slotAddress: { fontSize: 13, color: '#2e7d32', marginTop: 2, fontWeight: '500' },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fdecea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  summaryText: { fontSize: 13, color: '#666', fontWeight: '500' },
});
