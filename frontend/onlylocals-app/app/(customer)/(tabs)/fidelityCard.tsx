import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FidelityCardData, FidelityShopEntry, getFidelityCard } from '../../../services/userServices';

export default function FidelityCardScreen() {
  const [data, setData] = useState<FidelityCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getFidelityCard()
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, [])
  );

  const toggleShop = (shopId: string) => {
    setExpandedShopId(prev => (prev === shopId ? null : shopId));
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Fidelity Card</Text>
        <Text style={styles.pageSubtitle}>Mostra il QR al venditore per accumulare punti</Text>
      </View>

      {/* QR Card */}
      <View style={styles.qrCard}>
        {data?.barcode ? (
          <>
            <QRCode
              value={data.barcode}
              size={200}
              color="#1a2a4a"
              backgroundColor="#ffffff"
            />
            <Text style={styles.barcodeText}>{data.barcode}</Text>
          </>
        ) : (
          <View style={styles.noCardBox}>
            <Ionicons name="card-outline" size={48} color="#ccc" />
            <Text style={styles.noCardText}>Nessuna fidelity card trovata</Text>
          </View>
        )}
      </View>

      {/* Shop list */}
      <Text style={styles.sectionTitle}>I tuoi negozi</Text>

      {!data || !data.shops || data.shops.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="storefront-outline" size={40} color="#ccc" />
          <Text style={styles.emptyText}>
            Non hai ancora punti in nessun negozio.{'\n'}Scansiona la tua card per iniziare!
          </Text>
        </View>
      ) : (
        data.shops.map(shop => (
          <ShopCard
            key={shop.shopId}
            shop={shop}
            expanded={expandedShopId === shop.shopId}
            onToggle={() => toggleShop(shop.shopId)}
          />
        ))
      )}
    </ScrollView>
  );
}

function ShopCard({
  shop,
  expanded,
  onToggle,
}: {
  shop: FidelityShopEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.shopCard}>
      <TouchableOpacity style={styles.shopRow} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.shopInfo}>
          <Ionicons name="storefront-outline" size={20} color="#1a2a4a" />
          <Text style={styles.shopName}>{shop.shopName}</Text>
        </View>
        <View style={styles.shopRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{shop.punti} pt</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#888"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.vantaggiBox}>
          {shop.vantaggi.length === 0 ? (
            <Text style={styles.noVantaggiText}>Nessun premio configurato per questo negozio.</Text>
          ) : (
            <>
              <Text style={styles.vantaggiTitle}>Premi disponibili</Text>
              {shop.vantaggi.map((v, i) => {
                const reachable = shop.punti >= v.sogliaPunti;
                return (
                  <View key={i} style={[styles.vantaggioRow, reachable && styles.vantaggioReachable]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vantaggioDesc}>{v.descrizione}</Text>
                      <Text style={styles.vantaggioSub}>
                        {reachable
                          ? `Riscattabile! (hai ${shop.punti} / ${v.sogliaPunti} pt)`
                          : `${shop.punti} / ${v.sogliaPunti} pt`}
                      </Text>
                    </View>
                    {reachable && (
                      <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    )}
                  </View>
                );
              })}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f7fa' },
  header:           { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  pageTitle:        { fontSize: 26, fontWeight: '700', color: '#1a2a4a', letterSpacing: -0.3 },
  pageSubtitle:     { fontSize: 13, color: '#6b6b6b', marginTop: 4 },

  qrCard:           {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 28,
  },
  barcodeText:      { marginTop: 16, fontSize: 12, color: '#aaa', letterSpacing: 1.5, fontFamily: 'monospace' },
  noCardBox:        { alignItems: 'center', gap: 12 },
  noCardText:       { fontSize: 14, color: '#aaa', textAlign: 'center' },

  sectionTitle:     { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginHorizontal: 20, marginBottom: 10 },

  emptyBox:         { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText:        { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 21, paddingHorizontal: 32 },

  shopCard:         {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  shopRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  shopInfo:         { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  shopName:         { fontSize: 15, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  shopRight:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsBadge:      { backgroundColor: '#e6f1fb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pointsText:       { fontSize: 12, fontWeight: '700', color: '#0c447c' },

  vantaggiBox:      { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.07)', padding: 14, gap: 8 },
  vantaggiTitle:    { fontSize: 12, fontWeight: '600', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  noVantaggiText:   { fontSize: 13, color: '#aaa', fontStyle: 'italic' },
  vantaggioRow:     {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fb',
  },
  vantaggioReachable: { backgroundColor: '#edfaf1' },
  vantaggioDesc:    { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  vantaggioSub:     { fontSize: 12, color: '#6b6b6b', marginTop: 2 },
});
