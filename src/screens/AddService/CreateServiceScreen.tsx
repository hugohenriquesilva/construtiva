import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../types/navigation";
import { BottomTabKey } from "../../../types/home";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import GradientButton from "../../components/GradientButton/GradientButton";
import { useProfessions } from "../../hooks/useProfessions";
import { formatProfessionName } from "../../utils/formatProfessionName";
import { reviewServiceDescription } from "../../services/aiReviewService";
import { createService } from "../../services/serviceService";
import { styles } from "./CreateServiceScreen.styles";

const GRADIENT: [string, string] = [
  "rgba(91, 105, 163, 1)",
  "rgba(210, 110, 56, 1)",
];

const AREAS = [
  "Elétrica",
  "Hidráulica",
  "Pintura",
  "Reforma",
  "Jardinagem",
  "Marcenaria",
  "Limpeza",
];

const MAX_PHOTOS = 5;
const MAX_DESCRIPTION = 600;

// Cartão de seção reutilizável (ícone + título + conteúdo)
function Section({
                   icon,
                   title,
                   children,
                 }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: ReactNode;
}) {
  return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={18} color="#5B69A3" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
      </View>
  );
}

export default function CreateServiceScreen() {
  const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { namesById } = useProfessions();

  // ---------- Estado do formulário ----------
  const [title, setTitle] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [cep, setCep] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  // ---------- Estado do envio ----------
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("");

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") navigation.navigate("Home");
    else if (tab === "professional") navigation.navigate("BuscaPortfolio");
    else if (tab === "menu") navigation.navigate("MaisInformacoes");
  };

  const toggleArea = (area: string) => {
    setAreas((prev) =>
        prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  const handleCepChange = async (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    setCep(digits);

    if (digits.length !== 8) {
      setLocation("");
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      setLocation(
          data.erro ? "CEP não encontrado" : `${data.localidade} - ${data.uf}`,
      );
    } catch {
      setLocation("Não foi possível buscar o CEP");
    }
  };

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  // ---------- Publicar: valida → IA → Firestore ----------
  const handleSubmit = async () => {
    if (submitting) return;

    if (!title.trim() || !description.trim() || areas.length === 0) {
      Alert.alert("Campos obrigatórios", "Preencha título, área e descrição.");
      return;
    }
    if (!professionId) {
      Alert.alert("Profissão", "Selecione a profissão desejada.");
      return;
    }
    if (cep.length !== 8 || location.includes("não")) {
      Alert.alert("CEP", "Informe um CEP válido.");
      return;
    }

    setSubmitting(true);
    try {
      // 1) IA analisa a descrição
      setStep("Analisando sua descrição...");
      const review = await reviewServiceDescription(title, description);

      if (review.verdict === "rejected") {
        Alert.alert("Não foi possível publicar", review.reason);
        return; // o finally abaixo ainda roda
      }

      // 2) se a IA melhorou, usamos o texto novo
      const originalDescription = description.trim();
      let finalDescription = originalDescription;
      if (review.verdict === "improved") {
        finalDescription = review.text;
        setDescription(review.text);
      }

      // 3) salva no Firebase
      setStep("Publicando seu serviço...");
      await createService({
        title,
        areas,
        professionId,
        description: finalDescription,
        cep,
        location,
        deadline,
        photos,
        aiReview: { verdict: review.verdict, originalDescription },
      });

      Alert.alert(
          "Serviço publicado!",
          review.verdict === "improved"
              ? "Ajustamos o texto da descrição para ficar mais claro."
              : "Seu serviço já está no ar.",
      );
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao publicar serviço:", error);
      Alert.alert(
          "Erro",
          "Não foi possível publicar agora. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
      setStep("");
    }
  };

  // ---------- Tela ----------
  return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.screen}>
          <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
          >
            {/* Cabeçalho */}
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#111111" />
              <Text style={styles.backText}>Voltar</Text>
            </Pressable>
            <Text style={styles.title}>Cadastrar serviço</Text>
            <Text style={styles.subtitle}>
              Conte o que você precisa e encontre o profissional ideal.
            </Text>

            {/* Sobre o serviço */}
            <Section icon="document-text-outline" title="Sobre o serviço">
              <Text style={styles.label}>Título</Text>
              <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex.: Troca de fiação da cozinha"
                  placeholderTextColor="#9C9C9C"
                  maxLength={80}
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva o que você precisa, local, tamanho, materiais..."
                  placeholderTextColor="#9C9C9C"
                  multiline
                  textAlignVertical="top"
                  maxLength={MAX_DESCRIPTION}
              />
              <Text style={styles.counter}>
                {description.length}/{MAX_DESCRIPTION}
              </Text>
            </Section>

            {/* Classificação */}
            <Section icon="pricetags-outline" title="Classificação">
              <Text style={styles.label}>Área de atuação</Text>
              <View style={styles.chipsRow}>
                {AREAS.map((area) => {
                  const selected = areas.includes(area);
                  return (
                      <Pressable
                          key={area}
                          onPress={() => toggleArea(area)}
                          style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                            style={[styles.chipText, selected && styles.chipTextSelected]}
                        >
                          {area}
                        </Text>
                      </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Profissão desejada</Text>
              <View style={styles.chipsRow}>
                {Object.keys(namesById).length === 0 && (
                    <Text style={styles.hint}>Carregando profissões...</Text>
                )}
                {Object.entries(namesById).map(([id, name]) => {
                  const selected = professionId === id;
                  return (
                      <Pressable
                          key={id}
                          onPress={() => setProfessionId(selected ? null : id)}
                          style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                            style={[styles.chipText, selected && styles.chipTextSelected]}
                        >
                          {formatProfessionName(name)}
                        </Text>
                      </Pressable>
                  );
                })}
              </View>
            </Section>

            {/* Local e prazo */}
            <Section icon="location-outline" title="Local e prazo">
              <Text style={styles.label}>CEP</Text>
              <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={20} color="#8D8D8D" />
                <TextInput
                    style={styles.inputInner}
                    value={cep}
                    onChangeText={handleCepChange}
                    keyboardType="number-pad"
                    maxLength={8}
                    placeholder="00000000"
                    placeholderTextColor="#9C9C9C"
                />
              </View>
              {!!location && <Text style={styles.locationText}>📍 {location}</Text>}

              <Text style={styles.label}>Prazo desejado</Text>
              <Pressable style={styles.inputRow} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#8D8D8D" />
                <Text style={deadline ? styles.inputText : styles.placeholderText}>
                  {deadline
                      ? deadline.toLocaleDateString("pt-BR")
                      : "Selecionar data"}
                </Text>
              </Pressable>
              {showPicker && (
                  <DateTimePicker
                      value={deadline ?? new Date()}
                      mode="date"
                      minimumDate={new Date()}
                      onChange={(_, date) => {
                        setShowPicker(false);
                        if (date) setDeadline(date);
                      }}
                  />
              )}
            </Section>

            {/* Fotos */}
            <Section icon="images-outline" title={`Fotos (${photos.length}/${MAX_PHOTOS})`}>
              <View style={styles.chipsRow}>
                {photos.map((uri) => (
                    <View key={uri}>
                      <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                      <Pressable
                          style={styles.removeBadge}
                          onPress={() => removePhoto(uri)}
                          accessibilityLabel="Remover foto"
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                ))}
                {photos.length < MAX_PHOTOS && (
                    <Pressable style={[styles.photo, styles.addPhoto]} onPress={pickPhotos}>
                      <Ionicons name="add" size={30} color="#8D8D8D" />
                    </Pressable>
                )}
              </View>
            </Section>

            {/* Publicar */}
            <View
                style={[styles.submitWrapper, submitting && styles.submitDisabled]}
                pointerEvents={submitting ? "none" : "auto"}
            >
              <GradientButton
                  label="Publicar serviço"
                  colors={GRADIENT}
                  onPress={handleSubmit}
              />
            </View>
            {submitting && (
                <View style={styles.stepRow}>
                  <ActivityIndicator color="#5B69A3" />
                  <Text style={styles.stepText}>{step}</Text>
                </View>
            )}
          </ScrollView>

          <BottomNavBar activeTab="add" onTabPress={handleTabPress} />
        </View>
      </SafeAreaView>
  );
}