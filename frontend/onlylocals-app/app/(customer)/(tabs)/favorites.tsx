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
import apiClient from '../../../services/api';
import { getNotifications } from '../../../services/notificationService';

interface FavoriteShop {
  _id: string;
  name: string;
  category: string[];
  description: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<FavoriteShop[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [shopsRes, notifications] = await Promise.all([
        apiClient.get('/users/favorites'),
        getNotifications(),
      ]);
      setShops(shopsRes.data.data ?? []);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch {
      setError('Errore nel caricamento dei preferiti.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const removeFromFavorites = async (shopId: string) => {
    try {
      await apiClient.delete('/users/favorites', { data: { shopId } });
      setShops(prev => prev.filter(s => s._id !== shopId));
    } catch {
      // ignore
    }
  };

  const renderShop = ({ item }: { item: FavoriteShop }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(customer)/shop/${item._id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopCategory}>{item.category.join(', ')}</Text>
        {item.description ? (
          <Text style={styles.shopDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromFavorites(item._id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="heart" size={24} color="#e53935" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferiti</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/(customer)/(tabs)/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={26} color="#255cb3" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#255cb3" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : shops.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>Nessun preferito ancora.</Text>
          <Text style={styles.emptySubText}>
            Salva un negozio dalla mappa per vederlo qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={item => item._id}
          renderItem={renderShop}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e53935',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  shopCategory: { fontSize: 13, color: '#255cb3', fontWeight: '500', marginBottom: 4 },
  shopDescription: { fontSize: 13, color: '#666' },
  removeBtn: { marginLeft: 12, padding: 4 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
  errorText: { fontSize: 15, color: '#e53935', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#255cb3', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
