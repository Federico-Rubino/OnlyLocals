import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
// Import Pressable from react-native
import { Pressable, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; // Path to your context




export default function TabLayout() {

  const { isLoggedIn, isLoading } = useAuth(); // Use global state
  const router = useRouter();

  // Show a loader while checking if the user has tokens
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#255cb3" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#255cb3', 
      headerShown: false               
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
          // This overrides the tab button to add logic
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={(e) => {
                if (!isLoggedIn) {
                  // Redirect to your login screen
                  router.push('/(auth)/login');
                } else {
                  // If logged in, perform default behavior
                  props.onPress?.(e);
                }
              }}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
          tabBarButton: (props) => (
            <Pressable
              {...props}
              onPress={(e) => {
                if (!isLoggedIn) {
                  router.push('/(auth)/login');
                } else {
                  props.onPress?.(e);
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
    </Tabs>
  );
}