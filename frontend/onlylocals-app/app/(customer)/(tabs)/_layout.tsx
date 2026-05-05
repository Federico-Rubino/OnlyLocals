import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#FF6600', // Colore del brand OnlyLocals
      headerShown: false               // Mostra il titolo in alto nella pagina
    }}>
      
      <Tabs.Screen
        name="fidelityCard" 
        options={{
          title: 'FidelityCard',
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="favorites" 
        options={{
          title: 'Favoriti',
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}