import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import BottomNavBar, { BottomTabKey } from '../../src/components/BottomNavBar/BottomNavBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<BottomTabKey>('menu');

  return (
    <Tabs
      tabBar={() => <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
