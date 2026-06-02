import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../../services/api';
import { getNotifications } from '../../../services/notificationService';
import { SavedSearch, userService } from '../../../services/userServices';

interface FavoriteShop {
  _id: string;
  name: string;
  category: string[];
  description: string;
}

type Tab = 'vetrine' | 'ricerche';

export default function FavoritesScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('vetrine');

  // --- Vetrine state ---
  const [shops, setShops] = useState<FavoriteShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState('');

  // --- Ricerche state ---
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [searchesLoading, setSearchesLoading] = useState(false);
  const [searchesError, setSearchesError] = useState('');

  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadAll = async () => {
        // Load shops
        setShopsLoading(true);
        setShopsError('');
        try {
          const res = await apiClient.get('/users/favorites');
          if (active) setShops(res.data.data ?? []);
        } catch (err: any) {
          if (active) {
            setShopsError(err?.response?.data?.message ?? err?.message ?? 'Errore sconosciuto');
          }
        } finally {
          if (active) setShopsLoading(false);
        }

        // Load searches
        setSearchesLoading(true);
        setSearchesError('');
        try {
          const data = await userService.getSavedSearches();
          if (active) setSearches(data);
        } catch (err: any) {
          if (active) {
            setSearchesError(err?.response?.data?.message ?? err?.message ?? 'Errore sconosciuto');
          }
        } finally {
          if (active) setSearchesLoading(false);
        }

        // Notification badge
        try {
          const notifs = await getNotifications();
          if (active) setUnreadCount(notifs.filter((n: any) => !n.read).length);
        } catch {
          // non-critical
        }
      };

      loadAll();
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

  const removeSearch = async (raw: string) => {
    try {
      await userService.removeSearch(raw);
      setSearches(prev => prev.filter(s => s.raw !== raw));
    } catch {
      // ignore
    }
  };

  const searchLabel = (s: SavedSearch): string => {
    const parts: string[] = [];
    if (s.name) parts.push(`"${s.name}"`);
    if (s.categories && s.categories.length > 0) parts.push(s.categories.join(', '));
    return parts.join(' · ') || 'Ricerca senza titolo';
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
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
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* TAB SWITCHER */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'vetrine' && styles.tabBtnActive]}
          onPress={() => setActiveTab('vetrine')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="storefront-outline"
            size={15}
            color={activeTab === 'vetrine' ? '#fff' : '#255cb3'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'vetrine' && styles.tabBtnTextActive]}>
            Vetrine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ricerche' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ricerche')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="search-outline"
            size={15}
            color={activeTab === 'ricerche' ? '#fff' : '#255cb3'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'ricerche' && styles.tabBtnTextActive]}>
            Ricerche
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── VETRINE TAB ── */}
      {activeTab === 'vetrine' && (
        <>
          {shopsLoading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#255cb3" />
            </View>
          )}
          {!shopsLoading && shopsError !== '' && (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
              <Text style={styles.errorText}>{shopsError}</Text>
            </View>
          )}
          {!shopsLoading && shopsError === '' && shops.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="heart-outline" size={56} color="#ccc" />
              <Text style={styles.emptyTitle}>Nessuna vetrina salvata</Text>
              <Text style={styles.emptySub}>
                Aggiungi un negozio dalla mappa per vederlo qui.
              </Text>
            </View>
          )}
          {!shopsLoading && shopsError === '' && shops.length > 0 && (
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
        </>
      )}

      {/* ── RICERCHE TAB ── */}
      {activeTab === 'ricerche' && (
        <>
          {searchesLoading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#255cb3" />
            </View>
          )}
          {!searchesLoading && searchesError !== '' && (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
              <Text style={styles.errorText}>{searchesError}</Text>
            </View>
          )}
          {!searchesLoading && searchesError === '' && searches.length === 0 && (
            <View style={styles.center}>
              <Ionicons name="bookmark-outline" size={56} color="#ccc" />
              <Text style={styles.emptyTitle}>Nessuna ricerca salvata</Text>
              <Text style={styles.emptySub}>
                Usa il pulsante "Salva ricerca" nella home per salvare i tuoi filtri preferiti.
              </Text>
            </View>
          )}
          {!searchesLoading && searchesError === '' && searches.length > 0 && (
            <FlatList
              data={searches}
              keyExtractor={item => item.raw}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Ionicons name="search" size={20} color="#255cb3" style={styles.searchIcon} />
                  <View style={styles.info}>
                    {!!item.name && (
                      <Text style={styles.shopName}>{item.name}</Text>
                    )}
                    {item.categories && item.categories.length > 0 && (
                      <View style={styles.tagRow}>
                        {item.categories.map(cat => (
                          <View key={cat} style={styles.tag}>
                            <Text style={styles.tagText}>{cat}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {!item.name && (!item.categories || item.categories.length === 0) && (
                      <Text style={styles.desc}>Ricerca senza filtri</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSearch(item.raw)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#aaa" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </>
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

  // tab switcher
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: '#e8f0fd',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabBtnActive: { backgroundColor: '#255cb3' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#255cb3' },
  tabBtnTextActive: { color: '#fff' },

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
  searchIcon: { marginRight: 12 },
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
