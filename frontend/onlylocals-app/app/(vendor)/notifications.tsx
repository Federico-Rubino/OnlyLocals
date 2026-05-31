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

const VENDOR_BLUE = '#1a2a4a';

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#f5a623' : '#ccc'}
        />
      ))}
    </View>
  );
}

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

export default function VendorNotificationsScreen() {
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

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      await markNotificationRead(item._id).catch(() => {});
      setNotifications(prev =>
        prev.map(n => (n._id === item._id ? { ...n, read: true } : n))
      );
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => handlePress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={22}
          color={item.read ? '#aaa' : VENDOR_BLUE}
        />
        {!item.read && <View style={styles.dot} />}
      </View>

      <View style={styles.textWrap}>
        <View style={styles.topRow}>
          <Text style={styles.authorName}>{item.feedbackAuthorName}</Text>
          {item.feedbackRating !== undefined && (
            <StarRow rating={item.feedbackRating} />
          )}
        </View>
        {item.feedbackComment ? (
          <Text style={styles.comment} numberOfLines={3}>
            "{item.feedbackComment}"
          </Text>
        ) : (
          <Text style={styles.noComment}>Nessun commento</Text>
        )}
        <Text style={styles.sentAt}>{formatDate(item.sentAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={VENDOR_BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback ricevuti</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color={VENDOR_BLUE} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotifications} style={styles.retryBtn}>
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>Nessun feedback ancora.</Text>
          <Text style={styles.emptySubText}>
            Le recensioni dei clienti appariranno qui.
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
  cardUnread: { borderLeftWidth: 3, borderLeftColor: VENDOR_BLUE },
  iconWrap: { marginRight: 12, alignItems: 'center', position: 'relative' },
  dot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e53935',
  },
  textWrap: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  starRow: { flexDirection: 'row', gap: 2 },
  comment: { fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 6, lineHeight: 18 },
  noComment: { fontSize: 13, color: '#bbb', fontStyle: 'italic', marginBottom: 6 },
  sentAt: { fontSize: 11, color: '#bbb', textAlign: 'right' },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
  errorText: { fontSize: 15, color: '#e53935', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: VENDOR_BLUE, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
