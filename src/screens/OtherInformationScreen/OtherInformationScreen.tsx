import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { logoutUser } from '@/src/services/authService';

import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import { menuItems, profile } from './OtherInformationScreen.mock';
import { styles } from './OtherInformationScreen.styles';
import { BottomTabKey } from '../../../types/home';
import { RootStackParamList } from '../../../types/navigation';


function showMockAction(title: string) {
    Alert.alert(title, 'Esta ação será conectada à funcionalidade correspondente em breve.');
}



export default function OtherInformationScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    const handleTabPress = (tab: BottomTabKey) => {
        if (tab === 'home') {
            navigation.navigate('Home');
        } else if (tab === 'profile') {
            navigation.navigate('PortfolioProfissional', { hideBackButton: true });
        } else if (tab === 'menu') {
            // já está na tela de menu, não faz nada
        }
    };

    async function handleSignOut() {
        try {
            await logoutUser(); // signOut(auth) do seu authService.ts — desloga de verdade no Firebase
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (error) {
            Alert.alert('Erro ao sair', 'Não foi possível encerrar a sessão. Tente novamente.');
        }
    }

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
                            <Pressable
                                key={item.label}
                                style={styles.menuButton}
                                onPress={() => {
                                    if (item.label === 'Meu portfólio') {
                                        navigation.navigate('FormularioProfissional');
                                    } else {
                                        showMockAction(item.action);
                                    }
                                }}
                            >
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.status ? (
                                    <Text style={[styles.badge, item.status === 'Ativo' ? styles.activeBadge : styles.inactiveBadge]}>
                                        {item.status}
                                    </Text>
                                ) : null}
                            </Pressable>
                        ))}
                    </View>

                    <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutLabel}>Sair</Text>
                    </Pressable>
                </ScrollView>

                <BottomNavBar activeTab="menu" onTabPress={handleTabPress} />
            </View>
        </SafeAreaView>
    );
}