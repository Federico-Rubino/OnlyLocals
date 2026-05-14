// import { View, Text, StyleSheet } from 'react-native';

// export default function Page() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Pagina Favoriti</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   text: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
// });

import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Page() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pagina Favoriti</Text>
      
      {}
      <View style={{ marginTop: 20 }}>
        <Button 
          title="DEBUG: Vedi Vetrina Shop" 
          onPress={() => router.push('/(customer)/shop/69f72092cd05919b74f5e256')} 
          color="#ff9800" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});