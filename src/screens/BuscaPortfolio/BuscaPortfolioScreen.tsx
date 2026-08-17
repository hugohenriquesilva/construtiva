import React from 'react';
import { View, Text, FlatList, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import { mockResults, PortfolioResult } from './BuscaPortfolioScreen.mock';
import { styles } from './BuscaPortfolioScreen.styles';
import { BottomTabKey } from '../../../types/home';
import { RootStackParamList } from '../../../types/navigation';

export default function BuscaPortfolioScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      navigation.navigate('Home');
    } else if (tab === 'profile') {
      navigation.navigate('PortfolioProfissional', { hideBackButton: true });
    } else if (tab === 'menu') {
      navigation.navigate('MaisInformacoes');
    }
  };

  const renderItem = ({ item }: { item: PortfolioResult }) => (
    <View style={styles.resultCard}>
      <View style={styles.avatar}>
        <Feather name="user" size={22} color="#FFFFFF" />
      </View>

      <View style={styles.resultInfo}>
        {item.hasCnpj && (
          <View style={styles.cnpjBadge}>
            <Text style={styles.cnpjStar}>★</Text>
            <Text style={styles.cnpjText}>Com CNPJ</Text>
          </View>
        )}
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultOccupation}>{item.occupations.join(' | ')}</Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate('PortfolioProfissional', { hideBackButton: false })}
      >
        <Text style={styles.profileButtonText}>Perfil</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Feather name="search" size={20} color="#1A1A1A" />
          <Text style={styles.headerTitle}>Buscar portfólio</Text>
        </View>

        <Pressable style={styles.searchRow}>
          <Feather name="search" size={16} color="#9C9C9C" />
          <Text style={styles.searchPlaceholder}>Pesquisar tipo de profissional</Text>
        </Pressable>

        <FlatList
          data={mockResults}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}
