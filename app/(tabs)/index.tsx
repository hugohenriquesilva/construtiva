import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const profile = {
  name: 'Sara Carolina',
  document: '18.020-335',
  email: 'saracarol0907@gmail.com',
};

type PortfolioStatus = 'Ativo' | 'Inativo';

const menuItems = [
  { label: 'Minha senha', action: 'Alteração de senha' },
  { label: 'Meus contatos', action: 'Meus contatos' },
  { label: 'Meu portfólio', action: 'Meu portfólio', status: 'Ativo' as PortfolioStatus },
  { label: 'Nossa política de privacidade', action: 'Política de privacidade' },
  { label: 'Perguntas frequentes', action: 'Perguntas frequentes' },
];

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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 96 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 34 },
  title: { color: '#0B0B0B', fontSize: 23, fontWeight: '700', letterSpacing: -0.4 },
  profileCard: { alignItems: 'center', borderColor: '#888888', borderRadius: 16, borderWidth: 1.2, flexDirection: 'row', minHeight: 112, paddingHorizontal: 20 },
  avatar: { alignItems: 'center', backgroundColor: '#B68108', borderRadius: 32, height: 64, justifyContent: 'center', marginRight: 16, width: 64 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: { color: '#080808', fontSize: 20, fontWeight: '700', marginBottom: 2 },
  profileDetail: { color: '#7D7D7D', flexShrink: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  menuList: { gap: 22, marginTop: 28 },
  menuButton: { alignItems: 'center', borderColor: '#8D8D8D', borderRadius: 15, borderWidth: 1.2, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 40 },
  menuLabel: { color: '#0A0A0A', fontSize: 18, fontWeight: '700' },
  badge: { borderRadius: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4 },
  activeBadge: { backgroundColor: '#258344' },
  inactiveBadge: { backgroundColor: '#777777' },
  signOutButton: { borderColor: '#888888', borderRadius: 15, borderWidth: 1.2, marginHorizontal: 3, marginTop: 22, minHeight: 53, paddingHorizontal: 40, justifyContent: 'center' },
  signOutLabel: { color: '#E10B0B', fontSize: 18, fontWeight: '700' },
});
