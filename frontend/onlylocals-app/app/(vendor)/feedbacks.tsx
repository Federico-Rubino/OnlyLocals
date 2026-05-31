import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatistiche, type FeedbackEntry } from '../../services/shopServices';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const name =
          rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={star} name={name as any} size={15} color="#f59e0b" />;
      })}
    </View>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function FeedbacksScreen() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatistiche();
        setShopName(data.nomeShop ?? '');
        if (typeof data.statistiche !== 'string') {
          const sorted = [...(data.statistiche.storicoFeedback ?? [])].sort(
            (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
          );
          setFeedbacks(sorted);
        }
      } catch {
        // feedbacks stays empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1a2a4a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Recensioni</Text>
          {!!shopName && <Text style={styles.headerSub}>{shopName}</Text>}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a2a4a" />
        </View>
      ) : feedbacks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Ancora nessuna recensione</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.countLabel}>
            {feedbacks.length} {feedbacks.length === 1 ? 'recensione' : 'recensioni'}
          </Text>

          {feedbacks.map((fb, i) => (
            <View key={fb._id ?? i} style={styles.card}>
              <View style={styles.cardTop}>
                <StarRating rating={fb.voto} />
                <Text style={styles.date}>{formatDate(fb.data)}</Text>
              </View>
              {fb.commento ? (
                <Text style={styles.comment}>{fb.commento}</Text>
              ) : (
                <Text style={styles.noComment}>Nessun commento</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f5f7fa' },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.10)' },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0f2f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a2a4a' },
  headerSub:   { fontSize: 12, color: '#6b6b6b', marginTop: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText:   { fontSize: 15, color: '#aaa' },
  list:        { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  countLabel:  { fontSize: 13, color: '#6b6b6b', marginBottom: 12 },
  card:        { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', padding: 14, marginBottom: 10 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date:        { fontSize: 11, color: '#aaa' },
  comment:     { fontSize: 14, color: '#1a1a1a', lineHeight: 20 },
  noComment:   { fontSize: 13, color: '#bbb', fontStyle: 'italic' },
});
