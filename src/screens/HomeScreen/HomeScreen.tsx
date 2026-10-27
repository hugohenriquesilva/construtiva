import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { Coordinates, getClientLocation } from '../../services/locationService';
import { compareByProximity, distanceKm, hasValidCoordinates } from '../../utils/proximity';
import Ionicons from '@expo/vector-icons/Ionicons';

import ProfessionalCard from '../../components/ProfessionalCard/ProfessionalCard';
import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import { subscribeToCompleteProfessionals, subscribeToTopProfessionals } from '../../services/portfolioService';
import { useProfessions } from '../../hooks/useProfessions';
import { formatProfessionName } from '../../utils/formatProfessionName';
import { styles } from './HomeScreen.styles';
import { BottomTabKey, CompleteProfessional, Professional } from '../../../types/home';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';

function ProfileAvatar({ uri, name }: { uri: string; name: string }) {
    const [failed, setFailed] = useState(false);
    return (
        <View style={styles.profileAvatar}>
            <Ionicons name="person-outline" size={24} color="#8A8A8E" />
            {!!uri && !failed && (
                <Image
                    source={{ uri }}
                    style={styles.profileAvatarImage}
                    contentFit="cover"
                    accessibilityLabel={`Foto de ${name}`}
                    onError={(event) => {
                        setFailed(true);
                        // Não registra a URL, que pode conter tokens do Storage.
                        console.warn('[Home] Falha ao carregar foto do profissional:', name, event.error);
                    }}
                />
            )}
        </View>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loadingProfessionals, setLoadingProfessionals] = useState(true);
    const [professionalsError, setProfessionalsError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { namesById } = useProfessions();
    const professionName = (id: string) => formatProfessionName(namesById[id] ?? '');

    useFocusEffect(useCallback(() => {
        setLoadingProfessionals(true);
        setProfessionalsError(false);
        return subscribeToTopProfessionals(
            (results) => {
                setProfessionals(results);
                setLoadingProfessionals(false);
            },
            () => {
                setProfessionalsError(true);
                setLoadingProfessionals(false);
            },
        );
    // O contador reinicia a assinatura quando o usuário tenta novamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryCount]));

    const feedListRef = useRef<FlatList<CompleteProfessional & { distanceKm?: number }>>(null);
    const [completeProfessionals, setCompleteProfessionals] = useState<CompleteProfessional[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [profilesError, setProfilesError] = useState(false);

    useFocusEffect(useCallback(() => {
        setLoadingProfiles(true);
        setProfilesError(false);
        return subscribeToCompleteProfessionals((results) => {
            setCompleteProfessionals(results);
            setLoadingProfiles(false);
        }, () => {
            setProfilesError(true);
            setLoadingProfiles(false);
        });
    // O contador permite tentar novamente após falha na assinatura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryCount]));

    const [clientCoordinates, setClientCoordinates] = useState<Coordinates | null>(null);
    const [professionalCoordinates, setProfessionalCoordinates] = useState<Record<string, Coordinates>>({});

    useFocusEffect(useCallback(() => {
        let active = true;
        let unsubscribe: (() => void) | undefined;
        setClientCoordinates(null);
        setProfessionalCoordinates({});
        const loadLocation = async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                const location = await getClientLocation(uid);
                if (!active || !location || !/^\d{8}$/.test((location.zipCode ?? '').replace(/\D/g, ''))
                    || !hasValidCoordinates(location)) return;
                setClientCoordinates(location);
                unsubscribe = onSnapshot(collection(db, 'professionalLocations'), (snapshot) => {
                    if (!active) return;
                    const coordinates: Record<string, Coordinates> = {};
                    snapshot.docs.forEach((document) => {
                        const data = document.data();
                        if (hasValidCoordinates(data)) coordinates[document.id] = data;
                    });
                    setProfessionalCoordinates(coordinates);
                }, () => {
                    if (active) setProfessionalCoordinates({});
                });
            } catch {
                // A lista continua disponível em ordem alfabética sem localização.
            }
        };
        void loadLocation();
        return () => { active = false; unsubscribe?.(); };
    }, []));

    const sortedProfessionals = useMemo(() => completeProfessionals.map((professional) => ({
        ...professional,
        distanceKm: clientCoordinates && professionalCoordinates[professional.id]
            ? distanceKm(clientCoordinates, professionalCoordinates[professional.id])
            : undefined,
    })).sort(compareByProximity), [completeProfessionals, clientCoordinates, professionalCoordinates]);
    const hasDistances = sortedProfessionals.some((professional) => professional.distanceKm !== undefined);

    const [activeTab, setActiveTab] = useState<BottomTabKey>('home');
    useFocusEffect(useCallback(() => {
        setActiveTab('home');
    }, []));

    const handleProfessionalPress = (professional: Professional) => {
        navigation.navigate('PortfolioProfissional', {
            hideBackButton: false,
            professionalUid: professional.id,
        });
    };

    const handleTabPress = useCallback((tab: BottomTabKey) => {
        setActiveTab(tab);

        // Ao tocar na aba "Início", rola o feed de volta para o topo da tela
        if (tab === 'home') {
            feedListRef.current?.scrollToOffset({ offset: 0, animated: true });
        } else if (tab === 'professional') {
            navigation.navigate('BuscaPortfolio');
        }
        else if (tab === 'menu') {
            navigation.navigate('MaisInformacoes');
        }
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            <FlatList
                ref={feedListRef}
                data={profilesError ? [] : sortedProfessionals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.profileCard}
                        onPress={() => handleProfessionalPress(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver perfil de ${item.name}`}
                        activeOpacity={0.7}
                    >
                        <View style={styles.profileHeading}>
                            <ProfileAvatar key={item.avatarUrl} uri={item.avatarUrl} name={item.name} />
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{item.name}</Text>
                                <Text style={styles.profileLocation}>
                                    <Ionicons name="location-outline" size={14} /> {item.city}{item.distanceKm !== undefined ? ` • ${item.distanceKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km de você` : ''}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666666" />
                        </View>
                        <Text style={styles.profileProfession}>{professionName(item.mainProfessionId)}</Text>
                        {item.secondaryProfessionIds.length > 0 && (
                            <Text style={styles.profileSecondary}>{item.secondaryProfessionIds.map(professionName).join(' • ')}</Text>
                        )}
                        <Text style={styles.profileDescription} numberOfLines={2}>{item.aboutMe}</Text>
                        <View style={styles.profileFooter}>
                            <Text style={styles.profileLink}>Ver perfil</Text>
                            {(item.likesCount ?? 0) > 0 && (
                                <View style={styles.profileLikes}>
                                    <Ionicons name="heart-outline" size={14} color="#8A8A8E" />
                                    <Text style={styles.profileLikesText}>
                                        {item.likesCount} {item.likesCount === 1 ? 'curtida' : 'curtidas'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loadingProfiles ? <ActivityIndicator accessibilityLabel="Carregando portfólios" color="#1A1A1A" /> :
                    profilesError ? (
                        <View>
                            <Text style={styles.carouselMessage}>Não foi possível carregar os portfólios.</Text>
                            <TouchableOpacity accessibilityRole="button" onPress={() => setRetryCount((count) => count + 1)}>
                                <Text style={styles.retryText}>Tentar novamente</Text>
                            </TouchableOpacity>
                        </View>
                    ) : <Text style={styles.carouselMessage}>Nenhum portfólio completo disponível no momento.</Text>
                }
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.header}>
                            <Ionicons name="home-outline" size={22} color="#1A1A1A" />
                            <Text style={styles.headerTitle}>Início</Text>
                        </View>

                        {/* Carrossel de profissionais em destaque */}
                        <Text style={styles.sectionTitle}>
                            Profissionais mais curtidos
                        </Text>

                        <FlatList
                            data={professionalsError ? [] : professionals}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ProfessionalCard
                                    professional={item}
                                    onPress={handleProfessionalPress}
                                />
                            )}
                            horizontal
                            snapToInterval={272}
                            decelerationRate="fast"
                            ListEmptyComponent={
                                loadingProfessionals ? (
                                    <ActivityIndicator accessibilityLabel="Carregando profissionais" color="#1A1A1A" />
                                ) : professionalsError ? (
                                    <View>
                                        <Text style={styles.carouselMessage}>Não foi possível carregar os profissionais.</Text>
                                        <TouchableOpacity onPress={() => setRetryCount((count) => count + 1)} accessibilityRole="button">
                                            <Text style={styles.retryText}>Tentar novamente</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.carouselMessage}>Nenhum profissional disponível no momento.</Text>
                                )
                            }
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContent}
                            style={styles.carousel}
                        />

                        {/* Título do feed */}
                        <Text style={[styles.sectionTitle, styles.feedTitle]}>
                            {hasDistances ? 'Profissionais perto de você' : 'Encontre seu profissional'}
                        </Text>
                    </View>
                }

            />

            <BottomNavBar
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onAddPress={() => navigation.navigate('Adicionar')}
            />
        </SafeAreaView>
    );
}
