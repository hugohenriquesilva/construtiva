import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import BottomNavBar, { BottomTabKey } from '../../src/components/BottomNavBar/BottomNavBar';

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('profile');

  return (
    <Tabs
      tabBar={() => <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
