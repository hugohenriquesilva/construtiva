import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { BottomTabKey } from '../../../types/home';
import { styles } from './BottomNavBar.styles';

interface BottomNavBarProps {
  activeTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
}

const TABS: { key: BottomTabKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', icon: 'home-outline' },
  { key: 'documents', icon: 'document-text-outline' },
  { key: 'profile', icon: 'person-outline' },
  { key: 'tools', icon: 'construct-outline' },
  { key: 'menu', icon: 'menu-outline' },
];

export default function BottomNavBar({
  activeTab,
  onTabPress,
}: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? '#1A1A1A' : '#9B9B9B'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
