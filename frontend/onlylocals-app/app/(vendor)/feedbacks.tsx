import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatistiche, type FeedbackEntry } from '../../services/shopServices';

const VENDOR_BLUE = '#1a2a4a';

function authorLabel(user: FeedbackEntry['user']): string {
  if (!user || typeof user === 'string') return 'Cliente';
  const full = [user.name, user.surname].filter(Boolean).join(' ').trim();
  return full || 'Cliente';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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

export default function VendorFeedbacksScreen() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setError(null);
      const result = await getStatistiche();
      if (typeof result.statistiche === 'string') {
        setFeedbacks([]);
      } else {
        // mostra prima i feedback più recenti
        const list = [...(result.statistiche.storicoFeedback ?? [])].sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setFeedbacks(list);
      }
    } catch {
      setError('Errore nel caricamento dei feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const renderItem = ({ item }: { item: FeedbackEntry }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.authorName}>{authorLabel(item.user)}</Text>
        <StarRow rating={item.voto} />
      </View>
      {item.commento ? (
        <Text style={styles.comment}>"{item.commento}"</Text>
      ) : (
        <Text style={styles.noComment}>Nessun commento</Text>
      )}
      <Text style={styles.date}>{formatDate(item.data)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={VENDOR_BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recensioni</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color={VENDOR_BLUE} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchFeedbacks} style={styles.retryBtn}>
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : feedbacks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-outline" size={56} color="#ccc" />
          <Text style={styles.emptyText}>Nessuna recensione ancora.</Text>
          <Text style={styles.emptySubText}>
            Le recensioni dei clienti appariranno qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(_, i) => String(i)}
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
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  starRow: { flexDirection: 'row', gap: 2 },
  comment: { fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 6, lineHeight: 18 },
  noComment: { fontSize: 13, color: '#bbb', fontStyle: 'italic', marginBottom: 6 },
  date: { fontSize: 11, color: '#bbb', textAlign: 'right' },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
  errorText: { fontSize: 15, color: '#e53935', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: VENDOR_BLUE, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
