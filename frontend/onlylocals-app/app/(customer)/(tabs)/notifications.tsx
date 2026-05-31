import { Ionicons } from '@expo/vector-icons';
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
import { AppNotification, notificationService } from '../../../services/notificationServices';

export default function NotificationsScreen() {
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
    const date = new Date(item.eventDate).toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => !item.read && handleMarkAsRead(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Ionicons name="calendar-outline" size={22} color={item.read ? '#aaa' : '#255cb3'} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <Text style={styles.eventName}>{item.eventName}</Text>
          {!!item.eventDescription && (
            <Text style={styles.eventDesc} numberOfLines={2}>{item.eventDescription}</Text>
          )}
          <Text style={styles.eventDate}>{date}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifiche</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Segna tutte come lette</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nessuna notifica</Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : { paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f7fa' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  title:         { fontSize: 26, fontWeight: '700', color: '#1a2a4a' },
  markAllText:   { fontSize: 13, color: '#255cb3', fontWeight: '500' },
  item:          { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' },
  itemUnread:    { borderColor: '#255cb3', backgroundColor: '#f0f5ff' },
  itemIcon:      { marginRight: 12, marginTop: 2 },
  itemContent:   { flex: 1 },
  shopName:      { fontSize: 12, fontWeight: '600', color: '#255cb3', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  eventName:     { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  eventDesc:     { fontSize: 13, color: '#6b6b6b', marginBottom: 4 },
  eventDate:     { fontSize: 12, color: '#aaa' },
  unreadDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#255cb3', marginTop: 4, marginLeft: 6 },
  empty:         { alignItems: 'center', gap: 12 },
  emptyContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText:     { fontSize: 16, color: '#aaa' },
});
