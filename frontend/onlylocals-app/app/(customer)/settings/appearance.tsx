import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../_layout'; // Verifica che il percorso sia giusto!

export default function AppearanceScreen() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const isDark = theme === 'dark';

  // Definiamo i colori qui dentro per farli aggiornare al cambio del tema
  const colors = {
    bg: isDark ? '#121212' : '#f5f7fa',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#fff' : '#000',
    subText: isDark ? '#aaa' : '#999',
    border: isDark ? '#333' : '#f0f0f0',
    primary: '#255cb3',
    previewCard: isDark ? '#2a2a3e' : '#fff',
    previewBg: isDark ? '#1a1a2e' : '#e2e8f0'
  };

  return (
    // IMPORTANTE: backgroundColor deve essere preso da colors.bg
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      
      <Text style={[styles.pageTitle, { color: colors.text }]}>Aspetto</Text>

      {/* Preview */}
      <View style={[styles.preview, { backgroundColor: colors.previewBg }]}>
        <View style={[styles.previewCard, { backgroundColor: colors.previewCard }]}>
          <View style={[styles.previewAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.previewLine, { backgroundColor: colors.text, opacity: 0.8, width: '60%' }]} />
            <View style={[styles.previewLine, { backgroundColor: colors.text, opacity: 0.3, width: '40%', marginTop: 6 }]} />
          </View>
        </View>
        <Text style={[styles.previewLabel, { color: colors.text, opacity: 0.5 }]}>Anteprima tema</Text>
      </View>

      {/* Theme selection */}
      <Text style={[styles.sectionTitle, { color: colors.subText }]}>Tema</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {['light', 'dark'].map((mode, idx) => {
          const active = theme === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.row, 
                idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
              ]}
              onPress={() => setTheme(mode as 'light' | 'dark')}
            >
              <View style={[
                styles.iconWrap, 
                { backgroundColor: active ? (isDark ? '#255cb344' : '#e8f0fc') : (isDark ? '#2a2a2a' : '#f5f5f5') }
              ]}>
                <Ionicons 
                  name={mode === 'light' ? 'sunny-outline' : 'moon-outline'} 
                  size={20} 
                  color={active ? colors.primary : '#888'} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {mode === 'light' ? 'Chiaro' : 'Scuro'}
                </Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Altre sezioni... */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 8 },
  preview: { borderRadius: 20, padding: 20, marginBottom: 8, alignItems: 'center' },
  previewCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, width: '100%', gap: 12 },
  previewAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  previewLine: { height: 8, borderRadius: 4 },
  previewLabel: { fontSize: 11, marginTop: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16, marginLeft: 4 },
  card: { borderRadius: 16, overflow: 'hidden', elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500' },
});