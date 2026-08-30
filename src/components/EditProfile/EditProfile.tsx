import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import { db, storage } from '@/firebaseConfig';
import { fetchAddressByCep, CepAddress } from '@/src/services/cepService';
import { geocodeAddress, saveClientLocation, getClientLocation, Coordinates } from '@/src/services/locationService';
import { fetchGeohash } from '@/src/services/geohashService';
import { cepMask } from '@/src/utils/CepMask';
import GradientButton from '../GradientButton/GradientButton';
import PhotoUploadBox from '../PhotoUploadBox/PhotoUploadBox';
import { styles } from './EditProfile.styles';

const GRADIENT_COLORS: [string, string] = ['rgba(91, 105, 163, 1)', 'rgba(210, 110, 56, 1)'];

interface EditProfileProps {
  visible: boolean;
  uid: string | null;
  currentName: string;
  currentPhotoUri?: string | null;
  focusCep?: boolean;
  onClose: () => void;
  onSaved: (updates: { fullName: string; location?: boolean; photoUri?: string }) => void;
}

export default function EditProfile({ visible, uid, currentName, currentPhotoUri, focusCep, onClose, onSaved }: EditProfileProps) {
  const [name, setName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cep, setCep] = useState('');
  const [addressPreview, setAddressPreview] = useState<CepAddress | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const cepInputRef = useRef<TextInput>(null);

  // Sincroniza nome e foto exibidos sem mexer no que já foi digitado no CEP,
  // já que currentName/currentPhotoUri podem chegar tarde (carregam em paralelo no ecrã pai).
  useEffect(() => {
    if (visible) {
      setName(currentName);
      setPhotoUri(currentPhotoUri ?? null);
    }
  }, [visible, currentName, currentPhotoUri]);

  useEffect(() => {
    if (!visible) return;

    setAddressPreview(null);
    setCoords(null);
    setGeohash(null);
    setCep('');

    const loadExistingLocation = async () => {
      if (!uid) return;

      const existing = await getClientLocation(uid);
      if (existing) {
        setCep(cepMask(existing.zipCode ?? ''));
        setCoords({ latitude: existing.latitude, longitude: existing.longitude });
        setGeohash(existing.geohash ?? null);
      }
    };

    loadExistingLocation();
  }, [visible, uid]);

  function handlePhotoPress() {
    Alert.alert(
      photoUri ? 'Deseja alterar sua foto?' : 'Escolher foto',
      'Como você gostaria de alterar a sua foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: pickPhotoFromCamera },
        { text: 'Galeria', onPress: pickPhotoFromGallery },
      ]
    );
  }

  async function pickPhotoFromCamera() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão negada', 'Você precisa permitir acesso à câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
      console.error(error);
    }
  }

  async function pickPhotoFromGallery() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão negada', 'Você precisa permitir acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
      console.error(error);
    }
  }

  async function handleCepChange(value: string) {
    setCep(cepMask(value));
    setAddressPreview(null);
    setCoords(null);
    setGeohash(null);

    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const address = await fetchAddressByCep(digits);

      if (!address) {
        Alert.alert(
          'CEP não encontrado',
          'Não foi possível encontrar o endereço para o CEP informado.'
        );
        return;
      }

      setAddressPreview(address);

      const newCoords = await geocodeAddress({
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        zipCode: value,
      });

      if (!newCoords) {
        Alert.alert(
          'Endereço não localizado',
          'Não foi possível localizar as coordenadas deste CEP. Tente novamente.'
        );
        return;
      }
      setCoords(newCoords);

      const newGeohash = await fetchGeohash(newCoords.latitude, newCoords.longitude);
      setGeohash(newGeohash);

      Alert.alert('Sucesso', 'Dados de endereço encontrados com sucesso');
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSave() {
    if (!uid || cepLoading || savingProfile) return;

    if (!name.trim()) {
      Alert.alert('Erro', 'Informe seu nome.');
      return;
    }

    setSavingProfile(true);
    try {
      const updates: { fullName: string; location?: boolean; photoUri?: string } = { fullName: name.trim() };

      if (photoUri && photoUri.startsWith('file://')) {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const ext = photoUri.split('.').pop() || 'jpg';
        const photoRef = ref(storage, `profilePhoto/${uid}/avatar.${ext}`);
        const snapshot = await uploadBytes(photoRef, blob);
        updates.photoUri = await getDownloadURL(snapshot.ref);
      }

      if (coords) {
        const digits = cep.replace(/\D/g, '');
        await saveClientLocation(uid, coords.latitude, coords.longitude, geohash, digits);
        updates.location = true;
      }

      await setDoc(doc(db, 'users', uid), updates, { merge: true });

      onSaved(updates);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  }

  const saveDisabled = cepLoading || savingProfile;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        if (focusCep) cepInputRef.current?.focus();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Editar perfil</Text>

            <View style={styles.photoRow}>
              <PhotoUploadBox
                size={100}
                uri={photoUri}
                onPress={handlePhotoPress}
                overlayIcon={photoUri ? 'pencil' : undefined}
                onOverlayPress={handlePhotoPress}
              />
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#9B9B9B"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>CEP da residência</Text>
            <TextInput
              ref={cepInputRef}
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor="#9B9B9B"
              keyboardType="number-pad"
              value={cep}
              onChangeText={handleCepChange}
            />
            {cepLoading && <Text style={styles.hint}>Buscando endereço...</Text>}

            {addressPreview && (
              <View style={styles.addressPreview}>
                <Text style={styles.hint}>
                  {addressPreview.street}
                  {addressPreview.street ? ', ' : ''}
                  {addressPreview.neighborhood}
                </Text>
                <Text style={styles.hint}>{addressPreview.city}</Text>
              </View>
            )}

            <View style={styles.buttonWrapper}>
              <GradientButton
                label={savingProfile ? 'Salvando...' : 'Salvar'}
                colors={GRADIENT_COLORS}
                onPress={handleSave}
                disabled={saveDisabled}
              />
            </View>

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
