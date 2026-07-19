import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';

import { menuItems, profile } from './mock';
import { styles } from './styles';

function showMockAction(title: string) {
  Alert.alert(title, 'Esta ação será conectada à funcionalidade correspondente em breve.');
}

export default function OtherInformationScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Abrir menu" hitSlop={12} onPress={() => showMockAction('Menu')}>
              <MaterialCommunityIcons color="#111111" name="menu" size={32} />
            </Pressable>
            <Text style={styles.title}>Outras informações</Text>
          </View>

          <Pressable style={styles.profileCard} onPress={() => showMockAction('Dados do perfil')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SC</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileDetail}>{profile.document}</Text>
              <Text style={styles.profileDetail}>{profile.email}</Text>
            </View>
          </Pressable>

          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <Pressable key={item.label} style={styles.menuButton} onPress={() => showMockAction(item.action)}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.status ? (
                  <Text style={[styles.badge, item.status === 'Ativo' ? styles.activeBadge : styles.inactiveBadge]}>
                    {item.status}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.signOutButton} onPress={() => showMockAction('Sair')}>
            <Text style={styles.signOutLabel}>Sair</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
