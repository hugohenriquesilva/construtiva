import React, { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ProfessionalCard from '../../components/ProfessionalCard/ProfessionalCard';
import PostCard from '../../components/PostCard/PostCard';
import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import { mockProfessionals, mockFeedPosts } from './HomeScreen.mock';
import { styles } from './HomeScreen.styles';
import { BottomTabKey, FeedPost, Professional } from '../../../types/home';

// Gera posts extras "mockados" para simular paginação ao arrastar o feed
function generateMorePosts(page: number): FeedPost[] {
    return mockFeedPosts.map((post) => ({
        ...post,
        id: `${post.id}-p${page}`,
    }));
}

export default function HomeScreen() {
    const feedListRef = useRef<FlatList<FeedPost>>(null);

    const [activeTab, setActiveTab] = useState<BottomTabKey>('home');
    const [feedPosts, setFeedPosts] = useState<FeedPost[]>(mockFeedPosts);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        // Simula uma chamada de rede para atualizar o feed
        setTimeout(() => {
            setFeedPosts(mockFeedPosts);
            setPage(1);
            setRefreshing(false);
        }, 800);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (loadingMore) return;
        setLoadingMore(true);
        // Simula carregamento de mais posts ao chegar no fim da lista
        setTimeout(() => {
            const nextPage = page + 1;
            setFeedPosts((prev) => [...prev, ...generateMorePosts(nextPage)]);
            setPage(nextPage);
            setLoadingMore(false);
        }, 600);
    }, [loadingMore, page]);

    const handleProfessionalPress = (professional: Professional) => {
        // TODO: navegar para o perfil do profissional
        console.log('Ver agora:', professional.name);
    };

    const handlePostPress = (post: FeedPost) => {
        // TODO: navegar para o post completo
        console.log('Abrir post:', post.title);
    };

    const handleTabPress = useCallback((tab: BottomTabKey) => {
        setActiveTab(tab);

        // Ao tocar na aba "Início", rola o feed de volta para o topo da tela
        if (tab === 'home') {
            feedListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            <FlatList
                ref={feedListRef}
                data={feedPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard post={item} onPress={handlePostPress} />
                )}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onEndReachedThreshold={0.4}
                onEndReached={handleLoadMore}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.header}>
                            <Ionicons name="home-outline" size={22} color="#1A1A1A" />
                            <Text style={styles.headerTitle}>Início</Text>
                        </View>

                        {/* Carrossel de profissionais em destaque */}
                        <Text style={styles.sectionTitle}>
                            Profissionais de destaque por aqui
                        </Text>

                        <FlatList
                            data={mockProfessionals}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ProfessionalCard
                                    professional={item}
                                    onPress={handleProfessionalPress}
                                />
                            )}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContent}
                            style={styles.carousel}
                        />

                        {/* Título do feed */}
                        <Text style={[styles.sectionTitle, styles.feedTitle]}>
                            O que você precisa saber:
                        </Text>
                    </View>
                }
            />

            <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
        </SafeAreaView>
    );
}
