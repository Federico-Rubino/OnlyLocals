import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function VendorTabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1a2a4a',
      headerShown: false
    }}>

        <Tabs.Screen
        name="fidelity"
        options={{
          title: 'Fidelity',
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          title: 'Fotocamera',
          tabBarIcon: ({ color }) => <Ionicons name="camera-outline" size={24} color={color} />,
        }}
      />

        <Tabs.Screen
        name="index"
        options={{
          title: 'Vetrina',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />

       <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiche',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profilo"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

     

      

      

      

    </Tabs>
  );
}