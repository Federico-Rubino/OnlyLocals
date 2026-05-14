// app/(customer)/(tabs)/shop/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ShopResult from '../../../components/shopResult';
import { shopService } from '../../../services/shopServices';
import { Shop } from '../../../types/shop';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     if (id) {
//       loadShop();
//     }
//   }, [id]);

    useEffect(() => {
        // ID reale fornito dal database
        const testId = "69f72092cd05919b74f5e256"; 
        
        // Carichiamo questo ID specifico invece di quello dell'URL
        loadShop(testId); 
    }, []);

  const loadShop = async (targetID: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await shopService.getShopById(targetID);
      console.log("----------------------------");
      console.log("Dati ricevuti per l'ID:", id);
      console.log(JSON.stringify(data, null, 2));
      console.log("----------------------------");
      setShopData(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Impossibile caricare il negozio.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Render attuale - shopData è:", shopData?.name);

  return (
    <View style={styles.container}>
      <ShopResult 
        shopData={shopData}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});