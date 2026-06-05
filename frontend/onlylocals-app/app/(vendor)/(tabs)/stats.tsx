import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatistiche, type AccessoEntry, type StatisticheData } from '../../../services/shopServices';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Build a fixed 7-day window ending today, pre-filled with zeros so days with no visits still appear.
// Entries outside the window are ignored by the `key in counts` guard.
function groupAccessesByDay(accessi: AccessoEntry[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    counts[key] = 0;
  }

  accessi.forEach(entry => {
    const key = new Date(entry.data).toISOString().split('T')[0];
    if (key in counts) counts[key] += 1;
  });

  return Object.entries(counts).map(([date, count]) => ({
    label: new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
    count,
  }));
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map(star => {
        const name =
          rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={star} name={name as any} size={22} color="#f59e0b" />;
      })}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 3 },
});

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const MAX_BAR_H = 110;
  const totalViews = data.reduce((s, d) => s + d.count, 0);

  return (
    <View>
      <Text style={chartStyles.totalLabel}>
        Totale ultimi 7 giorni: <Text style={chartStyles.totalValue}>{totalViews}</Text>
      </Text>
      <View style={chartStyles.barsRow}>
        {data.map((item, i) => {
          const barH = Math.max((item.count / maxCount) * MAX_BAR_H, item.count > 0 ? 6 : 2);
          return (
            <View key={i} style={chartStyles.barCol}>
              {item.count > 0 && (
                <Text style={chartStyles.countLabel}>{item.count}</Text>
              )}
              <View
                style={[
                  chartStyles.bar,
                  {
                    height: barH,
                    backgroundColor: item.count > 0 ? '#1a2a4a' : '#e8eaee',
                  },
                ]}
              />
              <Text style={chartStyles.dayLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  totalLabel: { fontSize: 12, color: '#6b6b6b', marginBottom: 16 },
  totalValue: { fontWeight: '700', color: '#1a2a4a' },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 155,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', borderRadius: 4 },
  countLabel: { fontSize: 10, color: '#1a2a4a', fontWeight: '600', marginBottom: 3 },
  dayLabel: { fontSize: 9, color: '#6b6b6b', marginTop: 5, textAlign: 'center' },
});

export default function StatisticheScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticheData | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchStats() {
        setLoading(true);
        try {
          const result = await getStatistiche();
          setData(result);
        } catch (err: any) {
          Alert.alert('Errore', 'Impossibile caricare le statistiche');
        } finally {
          setLoading(false);
        }
      }
      fetchStats();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a2a4a" />
      </View>
    );
  }

  if (!data || typeof data.statistiche === 'string') {
    return (
      <View style={styles.center}>
        <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Nessuna statistica disponibile</Text>
      </View>
    );
  }

  const stats = data.statistiche;
  const chartData = groupAccessesByDay(stats.mappaAccessi ?? []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 50, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      <Text style={styles.pageTitle}>Statistiche</Text>
      {data.nomeShop ? (
        <Text style={styles.shopName}>{data.nomeShop}</Text>
      ) : null}

      {/* Stat cards row */}
      <View style={styles.row}>
        <View style={[styles.card, styles.cardHalf]}>
          <Ionicons name="heart" size={26} color="#e74c3c" />
          <Text style={styles.statNumber}>{stats.numSalvataggi ?? 0}</Text>
          <Text style={styles.statLabel}>Salvataggi</Text>
        </View>

        <View style={[styles.card, styles.cardHalf]}>
          <Ionicons name="chatbubble-ellipses" size={26} color="#1a2a4a" />
          <Text style={styles.statNumber}>{stats.totalFeedback ?? 0}</Text>
          <Text style={styles.statLabel}>Recensioni</Text>
        </View>
      </View>

      {/* Rating card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Valutazione media</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingNumber}>
            {stats.votoMedio != null ? Number(stats.votoMedio).toFixed(1) : '—'}
          </Text>
          <StarRating rating={Number(stats.votoMedio ?? 0)} />
        </View>
        <Text style={styles.ratingSubtitle}>
          {stats.totalFeedback
            ? `Basata su ${stats.totalFeedback} ${stats.totalFeedback === 1 ? 'recensione' : 'recensioni'}`
            : 'Ancora nessuna recensione'}
        </Text>

        <TouchableOpacity
          style={styles.feedbackBtn}
          onPress={() => router.push('/(vendor)/feedbacks')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles-outline" size={18} color="#1a2a4a" />
          <Text style={styles.feedbackBtnText}>Leggi le recensioni</Text>
          <Ionicons name="chevron-forward" size={18} color="#1a2a4a" />
        </TouchableOpacity>
      </View>

      {/* Views chart card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visite alla vetrina</Text>
        <Text style={styles.cardSubtitle}>Ultimi 7 giorni</Text>
        <BarChart data={chartData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 16 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText:     { fontSize: 15, color: '#aaa' },
  pageTitle:     { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3, marginBottom: 4 },
  shopName:      { fontSize: 13, color: '#6b6b6b', marginBottom: 20 },
  row:           { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card:          { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', padding: 16, marginBottom: 12 },
  cardHalf:      { flex: 1, alignItems: 'center', gap: 6, marginBottom: 0 },
  cardTitle:     { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  cardSubtitle:  { fontSize: 12, color: '#6b6b6b', marginBottom: 12 },
  statNumber:    { fontSize: 32, fontWeight: '700', color: '#1a2a4a' },
  statLabel:     { fontSize: 12, color: '#6b6b6b' },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  ratingNumber:  { fontSize: 40, fontWeight: '700', color: '#1a2a4a' },
  ratingSubtitle:{ fontSize: 12, color: '#6b6b6b' },
  feedbackBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.10)' },
  feedbackBtnText:{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1a2a4a' },
});
