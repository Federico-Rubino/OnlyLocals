import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { registerShop, ItinerarioPayload } from '../../services/shopServices';
import ItineraryBuilder, { ItineraryState, countSlots } from '../../components/ItineraryBuilder';

const CATEGORIES = [
  'Ortofrutta', 'Macelleria & Salumi', 'Latteria & Formaggi', 'Pescheria',
  'Gastronomia & Drink', 'Abbigliamento', 'Artigianato & Design', 'Libri & Media',
  'Eventi & Pop-up', 'Musei & Mostre', 'Benessere & Fitness', 'Ristorazione',
  'Tecnologia & Elettronica', 'Casa & Giardino', 'Giocattoli & Bambini',
  'Animali & Accessori', 'Servizi & Professionisti',
];

type Step = 'choice' | 'shop-form' | 'itinerary';

interface ShopForm {
  name: string;
  description: string;
  categories: string[];
}

interface ShopErrors {
  name?: string;
  description?: string;
  categories?: string;
}

function validateShop(form: ShopForm): ShopErrors {
  const errors: ShopErrors = {};
  if (!form.name.trim()) errors.name = 'obbligatorio';
  if (!form.description.trim()) errors.description = 'obbligatorio';
  if (form.categories.length === 0) errors.categories = 'Seleziona almeno una categoria';
  return errors;
}

// Convert the builder state into the backend payload, keeping only set slots.
function buildItinerarioPayload(state: ItineraryState): ItinerarioPayload {
  const out: ItinerarioPayload = {};
  for (const [day, slots] of Object.entries(state)) {
    const daySlots: ItinerarioPayload[string] = {};
    for (const [slot, loc] of Object.entries(slots ?? {})) {
      if (loc) {
        daySlots[slot] = {
          latitudine: loc.latitudine,
          longitudine: loc.longitudine,
          indirizzo: loc.indirizzo,
          oraInizio: loc.oraInizio,
          oraFine: loc.oraFine,
        };
      }
    }
    if (Object.keys(daySlots).length > 0) out[day] = daySlots;
  }
  return out;
}

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { updateRole, updateShopId, logout } = useAuth();

  const [step, setStep] = useState<Step>('choice');
  const [loading, setLoading] = useState(false);

  const [shopForm, setShopForm] = useState<ShopForm>({ name: '', description: '', categories: [] });
  const [shopErrors, setShopErrors] = useState<ShopErrors>({});
  const [itinerary, setItinerary] = useState<ItineraryState>({});

  const handleSelectCustomer = async () => {
    setLoading(true);
    try {
      // Backend sets role 'pending' -> 'customer'. This endpoint is one of the
      // only two a pending user is allowed to call.
      await apiClient.patch('/users/setAsCustomer');
      // Clear the session and send the new customer to the login page.
      await logout();
      router.replace('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Impossibile impostare il ruolo.');
      setLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setShopForm(prev => {
      const has = prev.categories.includes(cat);
      const categories = has
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories };
    });
    if (shopErrors.categories) setShopErrors(prev => ({ ...prev, categories: undefined }));
  };

  const handleGoToItinerary = () => {
    const errors = validateShop(shopForm);
    if (Object.keys(errors).length > 0) {
      setShopErrors(errors);
      return;
    }
    setStep('itinerary');
  };

  const handleRegisterShop = async () => {
    if (countSlots(itinerary) === 0) {
      Alert.alert(
        'Itinerario incompleto',
        'Imposta almeno una posizione per una fascia oraria prima di continuare.',
      );
      return;
    }
    setLoading(true);
    try {
      const result = await registerShop({
        name: shopForm.name.trim(),
        description: shopForm.description.trim(),
        category: shopForm.categories,
        itinerario: buildItinerarioPayload(itinerary),
      });
      await updateRole('vendor');
      await updateShopId(result.id);
    } catch (err: any) {
      Alert.alert('Errore', err.response?.data?.message || 'Registrazione attività fallita. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'choice') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Benvenuto!</Text>
        <Text style={styles.subtitle}>Come vuoi usare OnlyLocals?</Text>

        <TouchableOpacity style={styles.option} onPress={handleSelectCustomer} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.optionTitle}>Cliente</Text>
              <Text style={styles.optionDesc}>Scopri e salva i negozi locali</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.option, styles.optionVendor]}
          onPress={() => setStep('shop-form')}
          disabled={loading}
        >
          <Text style={styles.optionTitle}>Commerciante</Text>
          <Text style={styles.optionDesc}>Gestisci la tua attività commerciale</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'itinerary') {
    return (
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <ItineraryBuilder value={itinerary} onChange={setItinerary} />

        <TouchableOpacity
          style={[styles.button, styles.buttonItinerary, loading && styles.buttonDisabled]}
          onPress={handleRegisterShop}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registra attività</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setStep('shop-form')}
          style={styles.backButton}
          disabled={loading}
        >
          <Text style={styles.backText}>Indietro</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Registra la tua attività</Text>
      <Text style={styles.subtitle}>Inserisci le informazioni della tua attività commerciale</Text>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Nome attività</Text>
        <TextInput
          style={[styles.input, shopErrors.name && styles.inputError]}
          value={shopForm.name}
          onChangeText={v => {
            setShopForm(prev => ({ ...prev, name: v }));
            if (shopErrors.name) setShopErrors(prev => ({ ...prev, name: undefined }));
          }}
          placeholder="Es. Frutta e Verdura di Mario"
          autoCapitalize="words"
          returnKeyType="next"
        />
        {shopErrors.name && <Text style={styles.error}>{shopErrors.name}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Descrizione</Text>
        <TextInput
          style={[styles.input, styles.textArea, shopErrors.description && styles.inputError]}
          value={shopForm.description}
          onChangeText={v => {
            setShopForm(prev => ({ ...prev, description: v }));
            if (shopErrors.description) setShopErrors(prev => ({ ...prev, description: undefined }));
          }}
          placeholder="Breve descrizione della tua attività..."
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
          returnKeyType="next"
        />
        {shopErrors.description && <Text style={styles.error}>{shopErrors.description}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>Categorie</Text>
        <Text style={styles.labelHint}>Seleziona almeno una categoria</Text>
        <View style={styles.chipsContainer}>
          {CATEGORIES.map(cat => {
            const selected = shopForm.categories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {shopErrors.categories && <Text style={styles.error}>{shopErrors.categories}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGoToItinerary}>
        <Text style={styles.buttonText}>Avanti</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setStep('choice')} style={styles.backButton}>
        <Text style={styles.backText}>Indietro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a2a4a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  option: {
    width: '100%',
    backgroundColor: '#255cb3',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  optionVendor: {
    backgroundColor: '#2e7d32',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  spacer: {
    height: 16,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  labelHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#255cb3',
    borderColor: '#255cb3',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonItinerary: {
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    color: '#255cb3',
    fontWeight: '600',
  },
});
