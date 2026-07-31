import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
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
import { auth } from '@/firebaseConfig';

const BLUE = 'rgba(91, 105, 163, 1)';
const ORANGE = 'rgba(210, 110, 56, 1)';
const WHITE = 'rgba(255, 255, 255, 1)';

const SERVICE_PHOTOS_COUNT = 6;

export default function ProfessionalFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [form, setForm] = useState<ProfessionalFormData>({
    photoUri: null,
    isActive: true,
    area: null,
    mainProfession: null,
    secondaryProfessions: [],
    displayName: '',
    hasCnpj: true,
    cnpj: '',
    experienceRange: null,
    zipCode: '',
    radiusKm: 20,
    aboutMe: '',
    servicePhotos: Array(SERVICE_PHOTOS_COUNT).fill(null),
  });

  const [loading, setLoading] = useState(false);

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
  };

  const handleSave = async () => {
    try {
      // Validação básica
      if (!form.displayName || !form.area || !form.mainProfession) {
        Alert.alert('Erro', 'Preencha os campos obrigatórios');
        return;
      }

      setLoading(true);

      // Salvar no Firestore + upload de fotos
      await savePortfolio(form);

      // Sucesso - voltar pra "Mais Informações"
      Alert.alert('Sucesso!', 'Portfólio salvo com sucesso', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MaisInformacoes'),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o portfólio. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    Alert.alert(
      'Desativar portfólio',
      'Tem certeza que deseja desativar seu portfólio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Salvar com isActive: false
              await savePortfolio({ ...form, isActive: false });
              Alert.alert('Portfólio desativado', '', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('MaisInformacoes'),
                },
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível desativar o portfólio.');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePhotoPress = async (type: 'avatar' | 'service', index?: number) => {
    Alert.alert(
      'Escolher foto',
      'Como você gostaria de adicionar uma foto?',
      [
        {
          text: 'Câmera',
          onPress: () => pickPhotoFromCamera(type, index),
        },
        {
          text: 'Galeria',
          onPress: () => pickPhotoFromGallery(type, index),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('PortfolioProfissional', { hideBottomNavBar: true })}>
            <Text style={styles.headerTitle}>Pré-visualizar</Text>
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
            style={styles.textInput}
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
              style={styles.textInput}
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
          />
        </View>

        {/* CEP de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CEP de atuação</Text>
          <TextInput
            style={styles.textInput}
            placeholder="00000-000"
            placeholderTextColor="#9B9B9B"
            keyboardType="number-pad"
            value={form.zipCode}
            onChangeText={(v) => updateField('zipCode', cepMask(v))}
          />
        </View>

        {/* Raio de atuação */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Defina seu raio de atuação</Text>
          <View style={styles.sliderRow}>
            <Slider
              style={{ flex: 1 }}
              minimumValue={1}
              maximumValue={100}
              step={1}
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
            style={[styles.textInput, styles.textArea]}
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
              />
            ))}
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonsGroup}>
          <GradientButton
            label="Salvar alterações e publicar"
            colors={[BLUE, ORANGE]}
            onPress={handleSave}
          />
          <GradientButton
            label="Desativar meu portfólio"
            colors={[ORANGE, ORANGE]}
            onPress={handleDeactivate}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
