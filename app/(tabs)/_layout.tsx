import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Üstteki varsayılan başlığı gizle
        tabBarActiveTintColor: '#4df5bdff', // Aktif sekme rengi
      }}
    >
      <Tabs.Screen
        name="index" // Bu dosya adı 'index.tsx' ile eşleşir
        options={{
          title: 'Odaklan',
          tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rapor" // Bu dosya adı 'rapor.tsx' ile eşleşir
        options={{
          title: 'Raporlar',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}