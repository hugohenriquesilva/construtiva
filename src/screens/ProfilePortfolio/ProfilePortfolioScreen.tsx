import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import GradientButton from '../../components/GradientButton/GradientButton';
import { styles } from './ProfilePortfolio.styles';
import { BottomTabKey } from '../../../types/home';
import { RootStackParamList } from '../../../types/navigation';
import { getPortfolio, PortfolioData } from '../../services/portfolioService';
import { auth } from '@/firebaseConfig';

const COVER_COLORS: [string, string] = ['rgba(91, 105, 163, 1)', 'rgba(210, 110, 56, 1)'];

function chunk<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        rows.push(items.slice(i, i + size));
    }
    return rows;
}

export default function ProfilePortfolioScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PortfolioProfissional'>>();
    const hideBackButton = route.params?.hideBackButton ?? false;
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [selectedWork, setSelectedWork] = useState<string | null>(null);
    const [bioExpanded, setBioExpanded] = useState(false);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // Carregar o portfólio do usuário logado; se não existir ou estiver
    // desativado, manda pro formulário em vez de mostrar a tela vazia.
    useFocusEffect(
        useCallback(() => {
            const loadPortfolio = async () => {
                const uid = auth.currentUser?.uid;
                if (!uid) return;

                const data = await getPortfolio(uid);
                if (!data || !data.isActive) {
                    navigation.replace('FormularioProfissional');
                    return;
                }
                setPortfolio(data);
            };

            loadPortfolio();
        }, [navigation])
    );

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value;
        })
        .onUpdate((event) => {
            scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), 3);
        });

    const zoomedImageStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const closePreview = () => {
        scale.value = withTiming(1);
        savedScale.value = 1;
        setSelectedWork(null);
    };

    const handleTabPress = (tab: BottomTabKey) => {
        if (tab === 'home') {
            navigation.navigate('Home');
        } else if (tab === 'profile') {
            navigation.navigate('PortfolioProfissional', { hideBackButton: true });
        } else if (tab === 'menu') {
            navigation.navigate('MaisInformacoes');
        }
    };

    if (!portfolio) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.page} />
            </SafeAreaView>
        );
    }

    const workPhotos = portfolio.servicePhotos.filter((uri): uri is string => !!uri);
    const workRows = chunk(workPhotos, 3);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.page}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {!hideBackButton && (
                        <View style={styles.headerRow}>
                            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Feather name="chevron-left" size={32} color="#111" />
                                <Text style={styles.backText}>Voltar</Text>
                            </Pressable>
                        </View>
                    )}

                    <LinearGradient
                        colors={COVER_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cover}
                    />

                    <View style={styles.profileContent}>
                        {portfolio.photoUri && (
                            <Image source={{ uri: portfolio.photoUri }} style={styles.avatar} contentFit="cover" />
                        )}

                        {portfolio.hasCnpj && (
                            <View style={styles.cnpjBadge}>
                                <Text style={styles.star}>★</Text>
                                <Text style={styles.cnpjText}>Com CNPJ</Text>
                            </View>
                        )}

                        <View style={styles.headingRow}>
                            <View style={styles.headingText}>
                                <Text style={styles.name}>{portfolio.displayName}</Text>

                                {!!portfolio.zipCode && (
                                    <View style={styles.locationRow}>
                                        <Text style={styles.city}>{portfolio.zipCode}</Text>
                                        <Feather name="map-pin" size={17} color="#8D8D8D" />
                                    </View>
                                )}

                                <Text style={styles.occupation}>{portfolio.mainProfession}</Text>

                                {portfolio.secondaryProfessions.length > 0 && (
                                    <View style={styles.secondaryTagsRow}>
                                        {portfolio.secondaryProfessions.map((tag, index) => (
                                            <View key={`${tag}-${index}`} style={styles.secondaryTag}>
                                                <Text style={styles.secondaryTagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutTitle}>Sobre mim</Text>
                            <Text style={styles.bio} numberOfLines={bioExpanded ? undefined : 4}>
                                {portfolio.aboutMe}
                            </Text>
                            <Pressable onPress={() => setBioExpanded((prev) => !prev)}>
                                <Text style={styles.bioToggle}>{bioExpanded ? 'Mostrar menos' : 'Mostrar mais'}</Text>
                            </Pressable>
                        </View>

                        {workRows.length > 0 && (
                            <View style={styles.workSection}>
                                <Text style={styles.workTitle}>Meu trabalho:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workRowsScroll}>
                                    <View style={styles.workRows}>
                                        {workRows.map((row, rowIndex) => (
                                            <View key={`work-row-${rowIndex}`} style={styles.workRow}>
                                                {row.map((image, imageIndex) => (
                                                    <Pressable key={`${image}-${imageIndex}`} accessibilityLabel="Ampliar foto do trabalho" onPress={() => setSelectedWork(image)}>
                                                        <Image source={{ uri: image }} style={styles.workImage} contentFit="cover" />
                                                    </Pressable>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.editButtonWrapper}>
                            <GradientButton
                                label="Editar meu portfólio"
                                colors={COVER_COLORS}
                                onPress={() => navigation.navigate('FormularioProfissional')}
                            />
                            <Text style={styles.editHint}>
                                Você pode editar seu portfólio a qualquer momento
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <BottomNavBar activeTab={hideBackButton ? 'profile' : 'menu'} onTabPress={handleTabPress} />

                <Modal visible={selectedWork !== null} transparent animationType="fade" onRequestClose={closePreview}>
                    <View style={styles.imageModal}>
                        <Pressable style={styles.modalBackdrop} onPress={closePreview} />
                        <View style={styles.imagePreviewContainer}>
                            <GestureDetector gesture={pinchGesture}>
                                <Animated.View style={[styles.zoomableImage, zoomedImageStyle]}>
                                    <Image source={{ uri: selectedWork ?? undefined }} style={styles.imagePreview} contentFit="contain" />
                                </Animated.View>
                            </GestureDetector>
                            <Pressable accessibilityLabel="Fechar imagem ampliada" style={styles.closePreviewButton} onPress={closePreview}>
                                <Feather name="x" size={24} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
