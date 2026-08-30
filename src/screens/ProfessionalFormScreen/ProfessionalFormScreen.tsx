import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';

import SelectField from '../../components/SelectField/SelectField';
import ChipMultiSelect from '../../components/ChipMultiSelect/ChipMultiSelect';
import PhotoUploadBox from '../../components/PhotoUploadBox/PhotoUploadBox';
import GradientButton from '../../components/GradientButton/GradientButton';
import { cnpjMask } from '../../utils/CnpjMask';
import { cepMask } from '../../utils/CepMask';
import { styles } from './ProfessionalFormScreen.styles';
import {
  mockAreas,
  mockMainProfessions,
  mockSecondaryProfessions,
  mockExperienceRanges,
} from './ProfessionalFormScreen.mock';
import * as ImagePicker from 'expo-image-picker';
import { ProfessionalFormData } from '../../../types/professionalForm';
import { savePortfolio, getPortfolio } from '../../services/portfolioService';
import { fetchAddressByCep } from '../../services/cepService';
import { geocodeAddress, saveUserLocation, Coordinates } from '../../services/locationService';
import { fetchGeohash } from '../../services/geohashService';
import { auth } from '@/firebaseConfig';
import { AppAlert } from '@/src/components/AppAlert';

const BLUE = 'rgba(91, 105, 163, 1)';
const ORANGE = 'rgba(210, 110, 56, 1)';
const WHITE = 'rgba(255, 255, 255, 1)';

const SERVICE_PHOTOS_COUNT = 6;

export default function ProfessionalFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [form, setForm] = useState<ProfessionalFormData>({
    photoUri: null,
    isActive: false,
    area: null,
    mainProfession: null,
    secondaryProfessions: [],
    displayName: '',
    hasCnpj: true,
    cnpj: '',
    experienceRange: null,
    zipCode: '',
    street: '',
    neighborhood: '',
    city: '',
    radiusKm: 20,
    aboutMe: '',
    servicePhotos: Array(SERVICE_PHOTOS_COUNT).fill(null),
  });

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);
  const [errors, setErrors] = useState<Set<keyof ProfessionalFormData>>(new Set());
  const [successModalType, setSuccessModalType] = useState<'active' | 'inactive' | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Carregar dados existentes quando a tela abre
  useFocusEffect(
    React.useCallback(() => {
      const loadPortfolioData = async () => {
        try {
          const uid = auth.currentUser?.uid;
          if (uid) {
            const portfolio = await getPortfolio(uid);
            if (portfolio) {
              // Preencher o formulário com os dados salvos
              setForm({
                photoUri: portfolio.photoUri,
                isActive: portfolio.isActive,
                area: portfolio.area,
                mainProfession: portfolio.mainProfession,
                secondaryProfessions: portfolio.secondaryProfessions,
                displayName: portfolio.displayName,
                hasCnpj: portfolio.hasCnpj,
                cnpj: portfolio.cnpj,
                experienceRange: portfolio.experienceRange,
                zipCode: portfolio.zipCode,
                street: portfolio.street,
                neighborhood: portfolio.neighborhood,
                city: portfolio.city,
                radiusKm: portfolio.radiusKm,
                aboutMe: portfolio.aboutMe,
                servicePhotos: portfolio.servicePhotos,
              });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar portfólio:', error);
        }
      };

      loadPortfolioData();
    }, [])
  );

  const updateField = <K extends keyof ProfessionalFormData>(
    key: K,
    value: ProfessionalFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors = new Set<keyof ProfessionalFormData>();

    if (!form.photoUri) newErrors.add('photoUri');
    if (!form.area) newErrors.add('area');
    if (!form.mainProfession) newErrors.add('mainProfession');
    if (!form.displayName.trim()) newErrors.add('displayName');
    if (form.hasCnpj && !form.cnpj.trim()) newErrors.add('cnpj');
    if (!form.experienceRange) newErrors.add('experienceRange');
    if (!form.zipCode.trim()) newErrors.add('zipCode');
    if (!form.street.trim()) newErrors.add('street');
    if (!form.neighborhood.trim()) newErrors.add('neighborhood');
    if (!form.city.trim()) newErrors.add('city');
    if (!form.aboutMe.trim()) newErrors.add('aboutMe');

    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const handleZipCodeChange = async (value: string) => {
    updateField('zipCode', cepMask(value));
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
          'Não foi possível encontrar o endereço. Preencha rua, bairro e cidade manualmente.'
        );
        return;
      }

      updateField('street', address.street);
      updateField('neighborhood', address.neighborhood);
      updateField('city', address.city);

      const newCoords = await geocodeAddress({
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        zipCode: value,
      });

      if (!newCoords) return;
      setCoords(newCoords);

      const newGeohash = await fetchGeohash(newCoords.latitude, newCoords.longitude);
      setGeohash(newGeohash);

      Alert.alert('Sucesso', 'Endereço encontrado com sucesso');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Salvar no Firestore + upload de fotos
      await savePortfolio(form);

      // Salvar a localização (lat/lon/geohash) já resolvida ao digitar o CEP
      // (não bloqueia o sucesso do save principal)
      try {
        const uid = auth.currentUser?.uid;
        let locationCoords = coords;
        let locationGeohash = geohash;

        if (!locationCoords) {
          locationCoords = await geocodeAddress({
            street: form.street,
            neighborhood: form.neighborhood,
            city: form.city,
            zipCode: form.zipCode,
          });
          locationGeohash = locationCoords
            ? await fetchGeohash(locationCoords.latitude, locationCoords.longitude)
            : null;
        }

        console.log('[handleSave] uid:', uid, 'locationCoords:', locationCoords, 'locationGeohash:', locationGeohash, 'radiusKm:', form.radiusKm);

        if (uid && locationCoords) {
          await saveUserLocation(uid, locationCoords.latitude, locationCoords.longitude, locationGeohash, form.radiusKm);
          console.log('[handleSave] localização salva com sucesso');
        }
      } catch (error: any) {
        console.error('Erro ao salvar localização:', error?.message ?? error, error?.code);
      }

      setSuccessModalType(form.isActive ? 'active' : 'inactive');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o portfólio. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoPress = async (type: 'avatar' | 'service', index?: number) => {
    const isEditingAvatar = type === 'avatar' && !!form.photoUri;

    Alert.alert(
      isEditingAvatar ? 'Deseja alterar sua foto?' : 'Escolher foto',
      'Como você gostaria de alterar a sua foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Câmera',
          onPress: () => pickPhotoFromCamera(type, index),
        },
        {
          text: 'Galeria',
          onPress: () => pickPhotoFromGallery(type, index),
        },

      ]
    );
  };

  const handleDeleteServicePhoto = (index: number) => {
    const newServicePhotos = [...form.servicePhotos];
    newServicePhotos[index] = null;
    updateField('servicePhotos', newServicePhotos);
  };

  const pickPhotoFromCamera = async (type: 'avatar' | 'service', index?: number) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão negada', 'Você precisa permitir acesso à câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        if (type === 'avatar') {
          updateField('photoUri', photoUri);
        } else {
          const newServicePhotos = [...form.servicePhotos];
          newServicePhotos[index!] = photoUri;
          updateField('servicePhotos', newServicePhotos);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
      console.error(error);
    }
  };

  const pickPhotoFromGallery = async (type: 'avatar' | 'service', index?: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão negada', 'Você precisa permitir acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        if (type === 'avatar') {
          updateField('photoUri', photoUri);
        } else {
          const newServicePhotos = [...form.servicePhotos];
          newServicePhotos[index!] = photoUri;
          updateField('servicePhotos', newServicePhotos);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowLeaveConfirm(true)}
          >
            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Foto de perfil + status */}
        <View style={styles.photoRow}>
          <View>
            <Text style={styles.label}>Foto perfil:</Text>
            <PhotoUploadBox
              size={100}
              uri={form.photoUri}
              onPress={() => handlePhotoPress('avatar')}
              error={errors.has('photoUri')}
              overlayIcon={form.photoUri ? 'pencil' : undefined}
              onOverlayPress={() => handlePhotoPress('avatar')}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Perfil Ativo</Text>
            <Switch
              value={form.isActive}
              onValueChange={(v) => updateField('isActive', v)}
              trackColor={{ false: '#D9D9D9', true: '#7AC77A' }}
              thumbColor={WHITE}
            />
          </View>
        </View>

        {/* Área de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Selecione sua área de atuação</Text>
          <SelectField
            placeholder="Selecione"
            value={form.area}
            options={mockAreas}
            onSelect={(v) => updateField('area', v)}
            error={errors.has('area')}
          />
        </View>

        {/* Profissão principal */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Selecione sua profissão principal</Text>
          <SelectField
            placeholder="Selecione"
            value={form.mainProfession}
            options={mockMainProfessions}
            onSelect={(v) => updateField('mainProfession', v)}
            error={errors.has('mainProfession')}
          />
        </View>

        {/* Profissão secundária */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Selecione sua profissão secundária</Text>
          <ChipMultiSelect
            options={mockSecondaryProfessions}
            selected={form.secondaryProfessions}
            onChange={(v) => updateField('secondaryProfessions', v)}
          />
        </View>

        {/* Nome de exibição */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Nome que você quer que apareça no perfil
          </Text>
          <TextInput
            style={[styles.textInput, errors.has('displayName') && styles.inputError]}
            placeholder="Como os clientes vão te ver"
            placeholderTextColor="#9B9B9B"
            value={form.displayName}
            onChangeText={(v) => updateField('displayName', v)}
          />
        </View>

        {/* Possui CNPJ */}
        <View style={styles.cnpjToggleRow}>
          <Text style={styles.label}>Possui CNPJ:</Text>
          <Switch
            value={form.hasCnpj}
            onValueChange={(v) => updateField('hasCnpj', v)}
            trackColor={{ false: '#D9D9D9', true: '#7AC77A' }}
            thumbColor={WHITE}
          />
        </View>

        {form.hasCnpj && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CNPJ</Text>
            <TextInput
              style={[styles.textInput, errors.has('cnpj') && styles.inputError]}
              placeholder="00.000.000/0000-00"
              placeholderTextColor="#9B9B9B"
              keyboardType="number-pad"
              value={form.cnpj}
              onChangeText={(v) => updateField('cnpj', cnpjMask(v))}
            />
          </View>
        )}

        {/* Anos de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Anos de atuação</Text>
          <SelectField
            placeholder="Selecione uma faixa"
            value={form.experienceRange}
            options={mockExperienceRanges}
            onSelect={(v) => updateField('experienceRange', v)}
            error={errors.has('experienceRange')}
          />
        </View>

        {/* CEP de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CEP de atuação</Text>
          <TextInput
            style={[styles.textInput, errors.has('zipCode') && styles.inputError]}
            placeholder="00000-000"
            placeholderTextColor="#9B9B9B"
            keyboardType="number-pad"
            value={form.zipCode}
            onChangeText={handleZipCodeChange}
          />
          {cepLoading && (
            <Text style={styles.label}>Buscando endereço...</Text>
          )}
        </View>

        {form.zipCode.replace(/\D/g, '').length === 8 && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={[styles.textInput, errors.has('street') && styles.inputError]}
                placeholder="Nome da rua"
                placeholderTextColor="#9B9B9B"
                value={form.street}
                onChangeText={(v) => updateField('street', v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={[styles.textInput, errors.has('neighborhood') && styles.inputError]}
                placeholder="Bairro"
                placeholderTextColor="#9B9B9B"
                value={form.neighborhood}
                onChangeText={(v) => updateField('neighborhood', v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={[styles.textInput, errors.has('city') && styles.inputError]}
                placeholder="Cidade"
                placeholderTextColor="#9B9B9B"
                value={form.city}
                onChangeText={(v) => updateField('city', v)}
              />
            </View>
          </>
        )}

        {/* Raio de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Defina seu raio de atuação</Text>
          <View style={styles.sliderRow}>
            <Slider
              style={{ flex: 1 }}
              minimumValue={5}
              maximumValue={50}
              step={5}
              value={form.radiusKm}
              minimumTrackTintColor={BLUE}
              maximumTrackTintColor="#D9D9D9"
              thumbTintColor={BLUE}
              onValueChange={(v) => updateField('radiusKm', v)}
            />
            <Text style={styles.sliderValue}>{form.radiusKm} km</Text>
          </View>
        </View>

        {/* Sobre mim */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Sobre mim:</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              errors.has('aboutMe') && styles.inputError,
            ]}
            placeholder="Conte sua experiência e seus diferenciais"
            placeholderTextColor="#9B9B9B"
            multiline
            value={form.aboutMe}
            onChangeText={(v) => updateField('aboutMe', v)}
          />
        </View>

        {/* Fotos dos serviços */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Fotos de seus serviços:</Text>
          <View style={styles.photoGrid}>
            {form.servicePhotos.map((uri, index) => (
              <PhotoUploadBox
                key={index}
                size={98}
                uri={uri}
                onPress={() => handlePhotoPress('service', index)}
                overlayIcon={uri ? 'trash' : undefined}
                onOverlayPress={() => handleDeleteServicePhoto(index)}
              />
            ))}
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonsGroup}>
          <GradientButton
            label={loading ? 'Salvando...' : 'Salvar alterações e publicar'}
            colors={[BLUE, ORANGE]}
            onPress={handleSave}
            disabled={loading}
          />
        </View>
      </ScrollView>

      <AppAlert
        visible={successModalType !== null}
        character={
          successModalType === 'inactive'
            ? require('@/assets/images/chateado.png')
            : require('@/assets/images/deuCerto.png')
        }
        title={
          successModalType === 'inactive'
            ? 'Que pena que desativou seu portifólio!'
            : 'Parabéns por ativar o seu portifólio'
        }
        subTitle={null}
        messages={
          successModalType === 'inactive'
            ? [
              'Ninguém poderá mais ver os seus serviços.',
              'Seu portifólio deverá aparecer como desativado.',
            ]
            : [
              'Seu portfólio foi publicado',
              'Outras pessoas já podem ver as informações que você cadastrou',
              'Seu portifólio deverá aparecer como ativado.',
            ]
        }
        onClose={() => {
          setSuccessModalType(null);
          navigation.navigate('MaisInformacoes');
        }}
      />

      <AppAlert
        visible={showLeaveConfirm}
        character={require('@/assets/images/cuidado.png')}
        title="Tem certeza que deseja sair sem salvar as informações?"
        subTitle={null}
        messages={null}
        buttonLabel="Cancelar"
        onClose={() => setShowLeaveConfirm(false)}
        secondaryButtonLabel="Sair sem Salvar"
        onSecondaryPress={() => {
          setShowLeaveConfirm(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}
