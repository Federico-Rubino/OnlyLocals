// components/FilterBar.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const CATEGORIES = [
  'Ortofrutta', 'Macelleria & Salumi', 'Latteria & Formaggi', 'Pescheria', 
  'Gastronomia & Drink', 'Abbigliamento', 'Artigianato & Design',
  'Libri & Media', 'Eventi & Pop-up', 'Musei & Mostre', 
  'Benessere & Fitness', 'Ristorazione', 'Tecnologia & Elettronica', 
  'Casa & Garden', 'Giocattoli & Bambini', 'Animali & Accessori', 
  'Servizi & Professionisti'
];

interface FilterBarProps {
  selectedCategories: string[];
  onToggleCategory: (categories: string[]) => void;
}

const FilterBar = ({ selectedCategories, onToggleCategory }: FilterBarProps) => {
  
  const handlePress = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      // Remove if already selected
      onToggleCategory(selectedCategories.filter(item => item !== cat));
    } else {
      // Add to selection
      onToggleCategory([...selectedCategories, cat]);
    }
  };

  const clearFilters = () => onToggleCategory([]);

  return (
    <View style={styles.filterWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.chip, selectedCategories.length === 0 && styles.activeChip]}
          onPress={clearFilters}
        >
          <Text style={[styles.chipText, selectedCategories.length === 0 && styles.activeText]}>
            Tutti
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isSelected && styles.activeChip]}
              onPress={() => handlePress(cat)}
            >
              <Text style={[styles.chipText, isSelected && styles.activeText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterWrapper: {
    width: '100%',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeText: {
    color: 'white',
  },
});

export default FilterBar;