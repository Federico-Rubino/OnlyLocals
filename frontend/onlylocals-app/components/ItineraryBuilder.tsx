import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LocationPickerModal, { PickedCoordinates } from './LocationPickerModal';
import TimeRangePickerModal from './TimeRangePickerModal';

export type DayKey =
  | 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica';
export type SlotKey = 'mattina' | 'pomeriggio' | 'sera';

export interface PickedLocation extends PickedCoordinates {
  oraInizio: string; // "HH:MM"
  oraFine: string;   // "HH:MM"
}

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

type SlotMeta = {
  key: SlotKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultStart: string;
  defaultEnd: string;
};

const SLOTS: SlotMeta[] = [
  { key: 'mattina', label: 'Mattina', icon: 'sunny-outline', defaultStart: '08:00', defaultEnd: '13:00' },
  { key: 'pomeriggio', label: 'Pomeriggio', icon: 'partly-sunny-outline', defaultStart: '14:00', defaultEnd: '18:00' },
  { key: 'sera', label: 'Sera', icon: 'moon-outline', defaultStart: '19:00', defaultEnd: '23:00' },
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
  const [editingTime, setEditingTime] = useState<{ day: DayKey; slot: SlotKey } | null>(null);

  const dayHasSlots = (day: DayKey) =>
    Object.values(value[day] ?? {}).some(Boolean);

  const writeSlot = (day: DayKey, slot: SlotKey, loc: PickedLocation | null) => {
    const nextDay = { ...(value[day] ?? {}) };
    if (loc) nextDay[slot] = loc;
    else delete nextDay[slot];
    const next = { ...value, [day]: nextDay };
    // If every slot in this day is now empty, remove the day key entirely so
    // countSlots and buildItinerarioPayload never see zero-slot day entries.
    if (!Object.values(nextDay).some(Boolean)) delete next[day];
    onChange(next);
  };

  // Set/clear a slot's location, keeping existing hours or applying slot defaults.
  // existing?.oraInizio preserves custom hours the user already set — without this,
  // moving the pin would silently reset the time range to the slot default.
  const setLocation = (day: DayKey, slot: SlotKey, coords: PickedCoordinates | null) => {
    if (!coords) {
      writeSlot(day, slot, null);
      return;
    }
    const existing = value[day]?.[slot];
    const meta = SLOTS.find(s => s.key === slot)!;
    writeSlot(day, slot, {
      ...coords,
      oraInizio: existing?.oraInizio ?? meta.defaultStart,
      oraFine: existing?.oraFine ?? meta.defaultEnd,
    });
  };

  const setHours = (day: DayKey, slot: SlotKey, oraInizio: string, oraFine: string) => {
    const existing = value[day]?.[slot];
    if (!existing) return;
    writeSlot(day, slot, { ...existing, oraInizio, oraFine });
  };

  const total = countSlots(value);
  const editingLoc = editing ? value[editing.day]?.[editing.slot] : undefined;
  const dayMeta = DAYS.find(d => d.key === editing?.day);
  const slotMeta = SLOTS.find(s => s.key === editing?.slot);

  const timeLoc = editingTime ? value[editingTime.day]?.[editingTime.slot] : undefined;
  const timeDayMeta = DAYS.find(d => d.key === editingTime?.day);
  const timeSlotMeta = SLOTS.find(s => s.key === editingTime?.slot);

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
            <View key={s.key} style={[styles.slotCard, loc && styles.slotCardSet]}>
              <View style={styles.slotRow}>
                <TouchableOpacity
                  style={styles.slotMain}
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
                      <Text style={styles.slotSub}>Tocca per impostare la posizione</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {loc ? (
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => setLocation(selectedDay, s.key, null)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#c0392b" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="add-circle" size={26} color="#2e7d32" />
                )}
              </View>

              {loc && (
                <TouchableOpacity
                  style={styles.timeChip}
                  activeOpacity={0.7}
                  onPress={() => setEditingTime({ day: selectedDay, slot: s.key })}
                >
                  <Ionicons name="time-outline" size={14} color="#2e7d32" />
                  <Text style={styles.timeChipText}>{loc.oraInizio} – {loc.oraFine}</Text>
                  <Ionicons name="chevron-down" size={13} color="#2e7d32" />
                </TouchableOpacity>
              )}
            </View>
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
        onConfirm={(coords) => {
          if (editing) setLocation(editing.day, editing.slot, coords);
          setEditing(null);
        }}
      />

      <TimeRangePickerModal
        visible={editingTime !== null}
        dayLabel={timeDayMeta?.label ?? ''}
        slotLabel={timeSlotMeta?.label ?? ''}
        oraInizio={timeLoc?.oraInizio ?? timeSlotMeta?.defaultStart ?? '08:00'}
        oraFine={timeLoc?.oraFine ?? timeSlotMeta?.defaultEnd ?? '13:00'}
        onClose={() => setEditingTime(null)}
        onConfirm={(oraInizio, oraFine) => {
          if (editingTime) setHours(editingTime.day, editingTime.slot, oraInizio, oraFine);
          setEditingTime(null);
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3e6ea',
  },
  slotCardSet: { borderColor: '#2e7d32', backgroundColor: '#f5faf6' },
  slotRow: { flexDirection: 'row', alignItems: 'center' },
  slotMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
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
  slotAddress: { fontSize: 13, color: '#555', marginTop: 2, fontWeight: '500' },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#e3f1e5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    marginLeft: 58,
  },
  timeChipText: { fontSize: 13, color: '#2e7d32', fontWeight: '700' },
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
