import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchResponse, SearchResult, searchShop } from '../services/searchService';

const CATEGORIES = [
  'Ortofrutta', 'Macelleria & Salumi', 'Latteria & Formaggi', 'Pescheria', 
  'Gastronomia & Drink', 'Abbigliamento', 'Artigianato & Design',
  'Libri & Media', 'Eventi & Pop-up', 'Musei & Mostre', 
  'Benessere & Fitness', 'Ristorazione', 'Tecnologia & Elettronica', 
  'Casa & Giardino', 'Giocattoli & Bambini', 'Animali & Accessori', 
  'Servizi & Professionisti'
];

export interface SearchTrigger {
  query: string;
  categories: string[];
  ts: number; // changes each time so the effect always fires
}

interface SearchBarProps {
  onResultsFound: (results: SearchResult[]) => void;
  onClear: () => void;
  onSaveSearch?: (name: string, categories: string[]) => void;
  searchTrigger?: SearchTrigger | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultsFound, onClear, onSaveSearch, searchTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // consumedTs guards against re-running the same saved-search trigger when unrelated state re-renders the parent.
  const consumedTs = useRef<number>(0);

  const updateMapResults = async (query: string, categories: string[]) => {
    if (!query.trim() && categories.length === 0) {
      onClear();
      return;
    }

    try {
      const results: SearchResponse = await searchShop({
        name: query.trim() || undefined,
        category: categories.length > 0 ? categories : undefined,
      });
      onResultsFound(results.data || []);
      return results.data || [];
    } catch (err) {
      console.error("Fetch failed", err);
      return [];
    }
  };

  // 400 ms debounce: the API is only called after the user pauses typing,
  // not on every keystroke. clearTimeout cancels any pending call on each re-render.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      if (selectedCategories.length === 0) onClear();
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await updateMapResults(searchQuery, selectedCategories);
      setSuggestions(results || []);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchTrigger || searchTrigger.ts === consumedTs.current) return;
    consumedTs.current = searchTrigger.ts;

    const { query, categories } = searchTrigger;
    setSearchQuery(query);
    setSelectedCategories(categories);
    setShowSuggestions(false);

    if (!query.trim() && categories.length === 0) { onClear(); return; }

    setIsLoading(true);
    searchShop({
      name: query.trim() || undefined,
      category: categories.length > 0 ? categories : undefined,
    })
      .then(res => { onResultsFound(res.data || []); })
      .catch(err => console.error('Triggered search failed', err))
      .finally(() => setIsLoading(false));
  }, [searchTrigger]);

  // Category taps update the map immediately and never show the dropdown.
  // The suggestions list is text-search only; categories act as map filters.
  const toggleCategory = async (cat: string) => {
    const newCats = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];

    setSelectedCategories(newCats);
    setShowSuggestions(false);
    await updateMapResults(searchQuery, newCats);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={styles.icon} />
        ) : (
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholder="Cerca un posto o una categoria..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
        />
        {(searchQuery.length > 0 || selectedCategories.length > 0) && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterLine}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => toggleCategory(cat)}
                style={[styles.chip, isSelected && styles.activeChip]}
              >
                <Text style={[styles.chipText, isSelected && styles.activeText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {onSaveSearch && (searchQuery.length > 0 || selectedCategories.length > 0) && (
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSaveSearch(searchQuery, selectedCategories)}
          activeOpacity={0.75}
        >
          <Ionicons name="bookmark-outline" size={14} color="#fff" />
          <Text style={styles.saveBtnText}>Salva ricerca</Text>
        </TouchableOpacity>
      )}

      {showSuggestions && searchQuery.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <TouchableOpacity 
                key={item._id} 
                style={styles.suggestionItem}
                onPress={() => {
                  onResultsFound([item]);
                  setSearchQuery(item.name);
                  setShowSuggestions(false);
                }}
              >
                <Ionicons name="storefront-outline" size={14} color="#6B7280" />
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            !isLoading && <Text style={styles.emptyText}>Nessun risultato trovato</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: { flex: 1, fontSize: 16, color: '#333', marginLeft: 8 },
  icon: { marginRight: 4 },
  filterLine: {
    marginTop: 10,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  activeChip: { backgroundColor: '#255cb3', borderColor: '#255cb3' },
  chipText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  activeText: { color: 'white' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#255cb3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 5,
    elevation: 2,
  },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  suggestionText: { marginLeft: 10, fontSize: 14, color: '#111827' },
  emptyText: { padding: 15, textAlign: 'center', color: '#9CA3AF' }
});

export default SearchBar;