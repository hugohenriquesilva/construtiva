import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { professional, workRows } from './mock';
import { styles } from './styles';

export default function ProfilePortfolioScreen() {
  const router = useRouter();
  const [selectedWork, setSelectedWork] = useState<string | null>(null);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.page}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={32} color="#111" />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          <Image source={{ uri: professional.cover }} style={styles.cover} contentFit="cover" />

          <View style={styles.profileContent}>
            <Image source={{ uri: professional.avatar }} style={styles.avatar} contentFit="cover" />

            {professional.hasCnpj && (
              <View style={styles.cnpjBadge}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.cnpjText}>Com CNPJ</Text>
              </View>
            )}

            <View style={styles.headingRow}>
              <View style={styles.headingText}>
                <Text style={styles.name}>{professional.name}</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.city}>{professional.city}</Text>
                  <Feather name="map-pin" size={17} color="#8D8D8D" />
                </View>
                <Text style={styles.occupation}>{professional.occupation}</Text>
              </View>
            </View>

            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Sobre mim</Text>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={styles.bioScroll} contentContainerStyle={styles.bioContent}>
                <Text style={styles.bio}>{professional.bio}</Text>
              </ScrollView>
            </View>

            <View style={styles.workSection}>
              <Text style={styles.workTitle}>Meu trabalho:</Text>
              <View style={styles.workRows}>
                {workRows.map((row, rowIndex) => (
                  <ScrollView key={`work-row-${rowIndex}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workRow}>
                    {row.map((image, imageIndex) => (
                      <Pressable key={`${image}-${imageIndex}`} accessibilityLabel="Ampliar foto do trabalho" onPress={() => setSelectedWork(image)}>
                        <Image source={{ uri: image }} style={styles.workImage} contentFit="cover" />
                      </Pressable>
                    ))}
                  </ScrollView>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

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
