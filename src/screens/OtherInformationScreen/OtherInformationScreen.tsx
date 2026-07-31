import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { logoutUser } from '@/src/services/authService';
import { useCallback, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import { menuItems } from './OtherInformationScreen.mock';
import { styles } from './OtherInformationScreen.styles';
import { BottomTabKey } from '../../../types/home';
import { RootStackParamList } from '../../../types/navigation';
import { hasPortfolio } from '@/src/services/portfolioService';
import { auth, db } from '@/firebaseConfig';

function showMockAction(title: string) {
    Alert.alert(title, 'Esta ação será conectada à funcionalidade correspondente em breve.');
}

export default function OtherInformationScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [portfolioExists, setPortfolioExists] = useState(false);
    const [loading, setLoading] = useState(true);

    // Carregar perfil do usuário e status do portfólio ao abrir a tela
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const uid = auth.currentUser?.uid;
                    if (uid) {
                        // Carregar dados do perfil
                        const userRef = doc(db, 'users', uid);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setUserProfile(userSnap.data());
                        }

                        // Verificar se tem portfólio
                        const exists = await hasPortfolio(uid);
                        setPortfolioExists(exists);
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }, [])
    );

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
            await logoutUser();
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

                    {userProfile && (
                        <Pressable style={styles.profileCard} onPress={() => showMockAction('Dados do perfil')}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {userProfile?.fullName?.slice(0, 2).toUpperCase() || 'XX'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{userProfile?.fullName}</Text>
                                <Text style={styles.profileDetail}>{userProfile?.CPF}</Text>
                                <Text style={styles.profileDetail}>{userProfile?.email}</Text>
                            </View>
                        </Pressable>
                    )}

                    <View style={styles.menuList}>
                        {menuItems.map((item) => {
                            // Se for "Meu portfólio", mostrar status Ativo/Inativo
                            const displayStatus =
                                item.label === 'Meu portfólio'
                                    ? portfolioExists
                                        ? 'Ativo'
                                        : 'Inativo'
                                    : item.status;

                            return (
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
                                    {displayStatus ? (
                                        <Text
                                            style={[
                                                styles.badge,
                                                displayStatus === 'Ativo'
                                                    ? styles.activeBadge
                                                    : styles.inactiveBadge,
                                            ]}
                                        >
                                            {displayStatus}
                                        </Text>
                                    ) : null}
                                </Pressable>
                            );
                        })}
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