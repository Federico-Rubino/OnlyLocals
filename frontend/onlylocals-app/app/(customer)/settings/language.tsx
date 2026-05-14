import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import i18n from '../../../services/i18n';

const LANGUAGES = [
  { code: 'it', label: 'Italiano',    region: 'Europa' },
  { code: 'en', label: 'English',    region: 'Europa' },
  { code: 'fr', label: 'Français',   region: 'Europa' },
  { code: 'de', label: 'Deutsch',    region: 'Europa' },
  { code: 'es', label: 'Español',    region: 'Europa' },
];

export default function LanguageScreen() {
  const [selected, setSelected] = useState('it');
  const [search, setSearch]     = useState('');

  const filtered = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  // Group by region
  const regions = [...new Set(filtered.map(l => l.region))];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>Lingua</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#aaa" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca lingua…"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Current */}
      {!search && (
        <>
          <Text style={styles.sectionTitle}>Corrente</Text>
          <View style={styles.card}>
            {LANGUAGES.filter(l => l.code === selected).map(l => (
              <View key={l.code} style={styles.row}>
                <Text style={[styles.rowLabel, { flex: 1 }]}>{l.label}</Text>
                <Ionicons name="checkmark-circle" size={22} color="#255cb3" />
              </View>
            ))}
          </View>
        </>
      )}

      {/* All languages grouped */}
      {regions.map(region => (
        <View key={region}>
          <Text style={styles.sectionTitle}>{region}</Text>
          <View style={styles.card}>
            {filtered
              .filter(l => l.region === region)
              .map((l, idx, arr) => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.row, idx > 0 && styles.rowBorder]}
                  onPress={() => {setSelected(l.code);
                    i18n.changeLanguage(l.code);}
                  }
                >
                
                  <Text style={[styles.rowLabel, { flex: 1 }]}>{l.label}</Text>
                  {selected === l.code
                    ? <Ionicons name="checkmark-circle" size={22} color="#255cb3" />
                    : <Ionicons name="chevron-forward"  size={18} color="#ddd" />
                  }
                </TouchableOpacity>
              ))}
          </View>
        </View>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  pageTitle:   { fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 8 },
  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  sectionTitle:{ fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16, marginLeft: 4 },
  card:        { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row:         { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowBorder:   { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  flag:        { fontSize: 24 },
  rowLabel:    { fontSize: 15 },
});