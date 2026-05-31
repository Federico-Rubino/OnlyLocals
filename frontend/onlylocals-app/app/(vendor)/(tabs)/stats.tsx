import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStatistiche, type AccessoEntry, type StatisticheData } from '../../../services/shopServices';

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

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const name =
          rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={star} name={name as any} size={size} color="#f59e0b" />;
      })}
    </View>
  );
}

function BarChart({ data, totalAllTime }: { data: { label: string; count: number }[]; totalAllTime: number }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const MAX_BAR_H = 110;
  const recentTotal = data.reduce((s, d) => s + d.count, 0);
  const hasData = recentTotal > 0;

  return (
    <View>
      <View style={chartStyles.summaryRow}>
        <Text style={chartStyles.summaryItem}>
          Ultimi 7 giorni:{' '}
          <Text style={chartStyles.summaryValue}>{recentTotal}</Text>
        </Text>
        <Text style={chartStyles.summaryItem}>
          Totale:{' '}
          <Text style={chartStyles.summaryValue}>{totalAllTime}</Text>
        </Text>
      </View>

      {!hasData ? (
        <View style={chartStyles.emptyState}>
          <Ionicons name="bar-chart-outline" size={32} color="#d0d0d0" />
          <Text style={chartStyles.emptyText}>Nessuna visita negli ultimi 7 giorni</Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryItem:  { fontSize: 12, color: '#6b6b6b' },
  summaryValue: { fontWeight: '700', color: '#1a2a4a' },
  emptyState:   { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText:    { fontSize: 13, color: '#aaa', textAlign: 'center' },
  barsRow:      { flexDirection: 'row', alignItems: 'flex-end', height: 155, gap: 4 },
  barCol:       { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:          { width: '80%', borderRadius: 4 },
  countLabel:   { fontSize: 10, color: '#1a2a4a', fontWeight: '600', marginBottom: 3 },
  dayLabel:     { fontSize: 9, color: '#6b6b6b', marginTop: 5, textAlign: 'center' },
});

export default function StatisticheScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticheData | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function fetchStats() {
        setLoading(true);
        try {
          const result = await getStatistiche();
          setData(result);
        } catch {
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
  const totalAllTime = stats.mappaAccessi?.length ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 50, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      <Text style={styles.pageTitle}>Statistiche</Text>
      {!!data.nomeShop && <Text style={styles.shopName}>{data.nomeShop}</Text>}

      {/* Salvataggi + Recensioni */}
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

      {/* Rating card — entire card is tappable */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(vendor)/feedbacks')}
        activeOpacity={0.85}
      >
        <View style={styles.ratingHeader}>
          <Text style={styles.cardTitle}>Valutazione media</Text>
          <Ionicons name="chevron-forward" size={16} color="#aaa" />
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingNumber}>
            {stats.votoMedio != null && stats.votoMedio > 0
              ? Number(stats.votoMedio).toFixed(1)
              : '—'}
          </Text>
          <StarRating rating={Number(stats.votoMedio ?? 0)} size={22} />
        </View>

        <Text style={styles.ratingSubtitle}>
          {(stats.totalFeedback ?? 0) > 0
            ? `Basata su ${stats.totalFeedback} ${stats.totalFeedback === 1 ? 'recensione' : 'recensioni'} · Tocca per leggere`
            : 'Ancora nessuna recensione'}
        </Text>
      </TouchableOpacity>

      {/* Views chart card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visite alla vetrina</Text>
        <BarChart data={chartData} totalAllTime={totalAllTime} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 16 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText:      { fontSize: 15, color: '#aaa' },
  pageTitle:      { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3, marginBottom: 4 },
  shopName:       { fontSize: 13, color: '#6b6b6b', marginBottom: 20 },
  row:            { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card:           { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.10)', padding: 16, marginBottom: 12 },
  cardHalf:       { flex: 1, alignItems: 'center', gap: 6, marginBottom: 0 },
  cardTitle:      { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  statNumber:     { fontSize: 32, fontWeight: '700', color: '#1a2a4a' },
  statLabel:      { fontSize: 12, color: '#6b6b6b' },
  ratingHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  ratingNumber:   { fontSize: 40, fontWeight: '700', color: '#1a2a4a' },
  ratingSubtitle: { fontSize: 12, color: '#6b6b6b' },
});
