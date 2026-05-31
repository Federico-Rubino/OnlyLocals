import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await apiClient.get('/users/favorites');
          if (active) setShops(res.data.data ?? []);
        } catch (err: any) {
          if (active) {
            const msg =
              err?.response?.data?.message ?? err?.message ?? 'Errore sconosciuto';
            setErrorMsg(msg);
          }
        } finally {
          if (active) setLoading(false);
        }

        try {
          const notifs = await getNotifications();
          if (active) setUnreadCount(notifs.filter((n: any) => !n.read).length);
        } catch {
          // non-critical
        }
      };

      load();
      return () => { active = false; };
    }, [])
  );

  const removeShop = async (shopId: string) => {
    try {
      await apiClient.delete('/users/favorites', { data: { shopId } });
      setShops(prev => prev.filter(s => s._id !== shopId));
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>

      {/* ── HEADER WITH BELL ── */}
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

      {/* ── BODY ── */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#255cb3" />
        </View>
      )}

      {!loading && errorMsg !== '' && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {!loading && errorMsg === '' && shops.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={56} color="#ccc" />
          <Text style={styles.emptyTitle}>Nessun preferito</Text>
          <Text style={styles.emptySub}>
            Aggiungi un negozio dalla mappa per vederlo qui.
          </Text>
        </View>
      )}

      {!loading && errorMsg === '' && shops.length > 0 && (
        <FlatList
          data={shops}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/(customer)/shop/${item._id}`)}
            >
              <View style={styles.info}>
                <Text style={styles.shopName}>{item.name}</Text>
                <View style={styles.tagRow}>
                  {item.category.map(cat => (
                    <View key={cat} style={styles.tag}>
                      <Text style={styles.tagText}>{cat}</Text>
                    </View>
                  ))}
                </View>
                {!!item.description && (
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeShop(item._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart" size={24} color="#e53935" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  // header
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

  // states
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 14, color: '#e53935', textAlign: 'center', marginTop: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },

  // list
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
  info: { flex: 1, marginRight: 12 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  tag: {
    backgroundColor: '#e8f0fd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 12, color: '#255cb3', fontWeight: '500' },
  desc: { fontSize: 13, color: '#666' },
});
