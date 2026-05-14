import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchResult } from '../services/searchService';
import { DayKey, SlotKey, getCurrentDayKey, getCurrentSlotKey } from '../utils/getCurrentSlot';

interface ShopResultsListProps {
  results: SearchResult[];
  onShopPress: (shop: SearchResult) => void;
  onClose: () => void;
}

const DAY_ORDER: DayKey[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
const SLOT_ORDER: SlotKey[] = ['mattina', 'pomeriggio', 'sera'];

const DAY_LABELS: Record<DayKey, string> = {
  lunedi: 'Lun', martedi: 'Mar', mercoledi: 'Mer',
  giovedi: 'Gio', venerdi: 'Ven', sabato: 'Sab', domenica: 'Dom',
};

const SLOT_LABELS: Record<SlotKey, string> = {
  mattina: 'mattina', pomeriggio: 'pomeriggio', sera: 'sera',
};

interface SlotInfo {
  indirizzo: string;
  dayLabel: string;
  slotLabel: string;
}

const getCurrentSlotInfo = (itinerario: SearchResult['itinerario']): SlotInfo | null => {
  const day = getCurrentDayKey();
  const slot = getCurrentSlotKey();
  const slotData = itinerario[day]?.[slot];
  if (!slotData?.indirizzo) return null;
  return { indirizzo: slotData.indirizzo, dayLabel: DAY_LABELS[day], slotLabel: SLOT_LABELS[slot] };
};

const getNextSlotInfo = (itinerario: SearchResult['itinerario']): SlotInfo | null => {
  const currentDay = getCurrentDayKey();
  const currentSlot = getCurrentSlotKey();
  const currentDayIdx = DAY_ORDER.indexOf(currentDay);
  const currentSlotIdx = SLOT_ORDER.indexOf(currentSlot);

  const upcoming: [DayKey, SlotKey][] = [];
  for (let di = currentDayIdx; di < DAY_ORDER.length; di++) {
    const startSlot = di === currentDayIdx ? currentSlotIdx + 1 : 0;
    for (let si = startSlot; si < SLOT_ORDER.length; si++) {
      upcoming.push([DAY_ORDER[di], SLOT_ORDER[si]]);
    }
  }
  for (let di = 0; di < currentDayIdx; di++) {
    for (const slot of SLOT_ORDER) upcoming.push([DAY_ORDER[di], slot]);
  }

  for (const [day, slot] of upcoming) {
    const slotData = itinerario[day]?.[slot];
    if (slotData?.indirizzo) {
      return { indirizzo: slotData.indirizzo, dayLabel: DAY_LABELS[day], slotLabel: SLOT_LABELS[slot] };
    }
  }
  return null;
};

const ShopResultsList: React.FC<ShopResultsListProps> = ({ results, onShopPress, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.handleBar} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {results.length} {results.length === 1 ? 'risultato' : 'risultati'}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {results.map((shop, index) => {
          const current = getCurrentSlotInfo(shop.itinerario);
          const next = !current ? getNextSlotInfo(shop.itinerario) : null;
          const isActive = !!current;

          return (
            <TouchableOpacity
              key={shop._id}
              style={[styles.card, index < results.length - 1 && styles.cardBorder]}
              onPress={() => onShopPress(shop)}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <View style={[styles.cardIcon, !isActive && styles.cardIconInactive]}>
                <Ionicons name="storefront" size={20} color={isActive ? '#3B82F6' : '#9CA3AF'} />
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardName} numberOfLines={1}>{shop.name}</Text>

                  {/* Green / Red badge */}
                  <View style={[styles.badge, isActive ? styles.badgeOpen : styles.badgeClosed]}>
                    <View style={[styles.badgeDot, isActive ? styles.badgeDotOpen : styles.badgeDotClosed]} />
                    <Text style={[styles.badgeText, isActive ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                      {isActive ? 'Aperto' : 'Chiuso'}
                    </Text>
                  </View>
                </View>

                {/* Current location */}
                {current && (
                  <View style={styles.cardRow}>
                    <Ionicons name="location" size={12} color="#3B82F6" />
                    <Text style={styles.cardAddressActive} numberOfLines={1}>{current.indirizzo}</Text>
                  </View>
                )}

                {/* Next slot */}
                {next && (
                  <View style={styles.cardRow}>
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.cardNext} numberOfLines={1}>
                      Prossimo: {next.dayLabel} {next.slotLabel} · {next.indirizzo}
                    </Text>
                  </View>
                )}

                {/* No schedule */}
                {!current && !next && (
                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={12} color="#D1D5DB" />
                    <Text style={styles.cardNoSchedule}>Nessun orario disponibile</Text>
                  </View>
                )}
              </View>

              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ShopResultsList;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIconInactive: {
    backgroundColor: '#F9FAFB',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeOpen: {
    backgroundColor: '#DCFCE7',
  },
  badgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeDotOpen: {
    backgroundColor: '#16A34A',
  },
  badgeDotClosed: {
    backgroundColor: '#DC2626',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextOpen: {
    color: '#16A34A',
  },
  badgeTextClosed: {
    color: '#DC2626',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardAddressActive: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
    fontWeight: '500',
  },
  cardNext: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  cardNoSchedule: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});