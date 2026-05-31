import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppNotification, notificationService } from '../../../services/notificationService';

function formatDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      Alert.alert('Errore', 'Impossibile caricare le notifiche');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch {
      Alert.alert('Errore', 'Impossibile aggiornare la notifica');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      Alert.alert('Errore', 'Impossibile aggiornare le notifiche');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isPromotion = item.type === 'promotion';
    const iconName: any = isPromotion ? 'pricetag-outline' : 'calendar-outline';
    const accentColor = isPromotion ? '#e65100' : '#255cb3';

    const title = isPromotion ? item.promotionDescription : item.eventName;
    const subtitle = isPromotion ? item.promotionValue : item.eventDescription;
    const dateLabel = isPromotion
      ? formatDate(item.promotionStartDate)
      : formatDate(item.eventDate);

    return (
      <TouchableOpacity
        style={[
          styles.item,
          !item.read && styles.itemUnread,
          isPromotion && !item.read && styles.itemUnreadPromo,
        ]}
        onPress={() => !item.read && handleMarkAsRead(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Ionicons name={iconName} size={22} color={item.read ? '#aaa' : accentColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.shopName, isPromotion && styles.shopNamePromo]}>
            {item.shopName}
          </Text>
          {!!title && <Text style={styles.eventName}>{title}</Text>}
          {!!subtitle && (
            <Text style={styles.eventDesc} numberOfLines={2}>{subtitle}</Text>
          )}
          {!!dateLabel && <Text style={styles.eventDate}>{dateLabel}</Text>}
        </View>
        {!item.read && (
          <View style={[styles.unreadDot, isPromotion && styles.unreadDotPromo]} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#255cb3" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#255cb3" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifiche</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Segna tutte come lette</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nessuna notifica</Text>
          </View>
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : { paddingBottom: 20 }
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f7fa' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  backBtn:         { width: 36, alignItems: 'flex-start' },
  title:           { fontSize: 26, fontWeight: '700', color: '#1a2a4a' },
  markAllText:     { fontSize: 13, color: '#255cb3', fontWeight: '500' },
  item:            { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' },
  itemUnread:      { borderColor: '#255cb3', backgroundColor: '#f0f5ff' },
  itemUnreadPromo: { borderColor: '#e65100', backgroundColor: '#fff8f0' },
  itemIcon:        { marginRight: 12, marginTop: 2 },
  itemContent:     { flex: 1 },
  shopName:        { fontSize: 12, fontWeight: '600', color: '#255cb3', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  shopNamePromo:   { color: '#e65100' },
  eventName:       { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  eventDesc:       { fontSize: 13, color: '#6b6b6b', marginBottom: 4 },
  eventDate:       { fontSize: 12, color: '#aaa' },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#255cb3', marginTop: 4, marginLeft: 6 },
  unreadDotPromo:  { backgroundColor: '#e65100' },
  empty:           { alignItems: 'center', gap: 12 },
  emptyContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:       { fontSize: 16, color: '#aaa' },
});
