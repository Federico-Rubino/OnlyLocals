import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  AppNotification,
  getNotifications,
  markNotificationRead,
} from '../../services/notificationService';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setError('Errore nel caricamento delle notifiche.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      await markNotificationRead(item._id).catch(() => {});
      setNotifications(prev =>
        prev.map(n => (n._id === item._id ? { ...n, read: true } : n))
      );
    }
    router.push(`/(customer)/shop/${item.shopId}`);
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isPromotion = item.type === 'promotion';
    const iconName = isPromotion ? 'pricetag-outline' : 'calendar-outline';
    const accentColor = isPromotion ? '#e65100' : '#255cb3';
    const title = isPromotion ? item.promotionDescription : item.eventName;
    const subtitle = isPromotion
      ? item.promotionValue
      : item.eventDescription;
    const dateLabel = isPromotion
      ? item.promotionStartDate
        ? `Dal ${formatDate(item.promotionStartDate)}${item.promotionEndDate ? ` al ${formatDate(item.promotionEndDate)}` : ''}`
        : null
      : item.eventDate
        ? formatDate(item.eventDate)
        : null;

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread, isPromotion && !item.read && styles.cardUnreadPromo]}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={iconName as any} size={22} color={item.read ? '#aaa' : accentColor} />
          {!item.read && <View style={[styles.dot, isPromotion && styles.dotPromo]} />}
        </View>
        <View style={styles.textWrap}>
          <View style={styles.labelRow}>
            <Text style={[styles.typeLabel, isPromotion && styles.typeLabelPromo]}>
              {isPromotion ? 'PROMOZIONE' : 'EVENTO'}
            </Text>
            <Text style={styles.shopName}>{item.shopName}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
          <View style={styles.metaRow}>
            {dateLabel ? <Text style={styles.dateLabel}>{dateLabel}</Text> : <View />}
            <Text style={styles.sentAt}>{formatDate(item.sentAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#255cb3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifiche</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#255cb3" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotifications} style={styles.retryBtn}>
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>Nessuna notifica.</Text>
          <Text style={styles.emptySubText}>
            Quando un negozio preferito aggiunge un evento o una promozione, lo vedrai qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#255cb3' },
  cardUnreadPromo: { borderLeftColor: '#e65100' },
  iconWrap: { marginRight: 12, alignItems: 'center', position: 'relative' },
  dot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#255cb3',
  },
  dotPromo: { backgroundColor: '#e65100' },
  textWrap: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  typeLabel: { fontSize: 10, fontWeight: '700', color: '#255cb3', letterSpacing: 0.5 },
  typeLabelPromo: { color: '#e65100' },
  shopName: { fontSize: 12, color: '#888', fontWeight: '500' },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#555', marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 11, color: '#888' },
  sentAt: { fontSize: 11, color: '#bbb' },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
  errorText: { fontSize: 15, color: '#e53935', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#255cb3', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
