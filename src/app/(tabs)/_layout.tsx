import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Bibliothèque d'icônes intégrée à Expo

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#c08a2d', // Votre couleur or/jaune
        tabBarInactiveTintColor: '#8a93a3',
        tabBarStyle: {
          backgroundColor: '#171a21', // Fond sombre pour la barre
          borderTopColor: '#262b36',
        },
        headerStyle: {
          backgroundColor: '#0f1115',
        },
        headerTintColor: '#e8edf4',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planifications"
        options={{
          title: 'Planifications',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="configuration"
        options={{
          title: 'Configuration',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}