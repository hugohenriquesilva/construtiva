import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Futuramente este objeto será preenchido a partir do documento do prestador no Firebase.
const professional = {
  name: 'Richard Santos',
  city: 'Santa Rita do Sapucaí',
  occupation: 'Pintor profissional',
  hasCnpj: true,
  avatar:
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=480&q=85',
  cover:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85',
  bio: 'Minha trajetória na construção civil começou como ajudante de pintura, aprendendo na prática a importância de preparar bem cada superfície antes de aplicar a primeira demão. Com dedicação, aperfeiçoei técnicas de massa corrida, pintura interna e externa, textura e acabamento fino em residências e comércios. Hoje atuo como pintor profissional em Santa Rita do Sapucaí e região, cuidando de cada obra com organização, pontualidade e atenção aos detalhes. Meu compromisso é entregar ambientes renovados, limpos e bem-acabados, sempre com transparência e respeito ao seu investimento. Se você procura um serviço confiável para transformar seu espaço, será um prazer conversar sobre o seu projeto.',
  work: [
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85',
  ],
};

const workRows = [professional.work.slice(0, 5), professional.work.slice(5, 10)];

export default function ProfileScreen() {
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
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={styles.bioScroll}
                contentContainerStyle={styles.bioContent}>
                <Text style={styles.bio}>{professional.bio}</Text>
              </ScrollView>
            </View>

            <View style={styles.workSection}>
              <Text style={styles.workTitle}>Meu trabalho:</Text>
              <View style={styles.workRows}>
                {workRows.map((row, rowIndex) => (
                  <ScrollView
                    key={`work-row-${rowIndex}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.workRow}>
                    {row.map((image, imageIndex) => (
                      <Pressable
                        key={`${image}-${imageIndex}`}
                        accessibilityLabel="Ampliar foto do trabalho"
                        onPress={() => setSelectedWork(image)}>
                        <Image source={{ uri: image }} style={styles.workImage} contentFit="cover" />
                      </Pressable>
                    ))}
                  </ScrollView>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={selectedWork !== null}
          transparent
          animationType="fade"
          onRequestClose={closePreview}>
          <View style={styles.imageModal}>
            <Pressable style={styles.modalBackdrop} onPress={closePreview} />
            <View style={styles.imagePreviewContainer}>
              <GestureDetector gesture={pinchGesture}>
                <Animated.View style={[styles.zoomableImage, zoomedImageStyle]}>
                  <Image source={{ uri: selectedWork ?? undefined }} style={styles.imagePreview} contentFit="contain" />
                </Animated.View>
              </GestureDetector>
              <Pressable
                accessibilityLabel="Fechar imagem ampliada"
                style={styles.closePreviewButton}
                onPress={closePreview}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 32 },
  backButton: { height: 92, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#111111', fontSize: 21, fontWeight: '700' },
  cover: { height: 188, width: '100%' },
  profileContent: { paddingHorizontal: 24, position: 'relative' },
  avatar: { width: 164, height: 164, borderRadius: 82, borderWidth: 6, borderColor: '#FFF', alignSelf: 'center', marginTop: -101 },
  headingRow: { marginTop: 11 },
  headingText: { width: '100%' },
  name: { color: '#0A0A0A', fontSize: 33, fontWeight: '700', letterSpacing: -0.8, flexShrink: 0 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  city: { color: '#7D7D7D', fontSize: 16, fontWeight: '600' },
  occupation: { color: '#7D7D7D', fontSize: 16, fontWeight: '600', marginTop: 10 },
  cnpjBadge: { position: 'absolute', top: 14, right: 24, borderWidth: 1.5, borderColor: '#B6B6B6', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF' },
  star: { color: '#D4AE54', fontSize: 13 },
  cnpjText: { color: '#7A7A7A', fontSize: 12, fontWeight: '600' },
  aboutCard: { height: 370, borderWidth: 1.5, borderColor: '#777', borderRadius: 29, marginTop: 42, paddingHorizontal: 40, paddingTop: 17 },
  aboutTitle: { color: '#0A0A0A', fontSize: 21, fontWeight: '700', marginBottom: 18 },
  bioScroll: { flex: 1, marginBottom: 18 },
  bioContent: { paddingRight: 18 },
  bio: { color: '#777', fontSize: 16, lineHeight: 21, textAlign: 'justify' },
  workSection: { marginTop: 36 },
  workTitle: { color: '#0A0A0A', fontSize: 23, fontWeight: '700', marginBottom: 28 },
  workRows: { gap: 18 },
  workRow: { gap: 16, paddingRight: 24 },
  workImage: { height: 172, width: 210, borderRadius: 18, borderWidth: 1, borderColor: '#E4E4E4', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  imageModal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.86)' },
  imagePreviewContainer: { width: '92%', height: '72%', position: 'relative' },
  zoomableImage: { width: '100%', height: '100%' },
  imagePreview: { width: '100%', height: '100%', borderRadius: 16 },
  closePreviewButton: { position: 'absolute', top: -12, right: -8, width: 42, height: 42, borderRadius: 21, backgroundColor: '#202020', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFFFFF' },
});
