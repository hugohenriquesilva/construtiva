import { useState } from "react";
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
import { styles } from "./CreateServiceScreen.styles";

const GRADIENT: [string, string] = [
  "rgba(91, 105, 163, 1)",
  "rgba(210, 110, 56, 1)",
];

// Troque pelas áreas que fizerem sentido pro seu app
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

export default function CreateServiceScreen() {
  const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Lista de profissões (mesmo hook usado no portfólio)
  const { namesById } = useProfessions();

  // ---------- Estados (um por campo) ----------
  const [title, setTitle] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [cep, setCep] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rewriting, setRewriting] = useState(false);

  // ---------- Navegação da barra inferior ----------
  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") navigation.navigate("Home");
    else if (tab === "professional") navigation.navigate("BuscaPortfolio");
    else if (tab === "menu") navigation.navigate("MaisInformacoes");
  };

  // ---------- Tags de área (múltipla escolha) ----------
  const toggleArea = (area: string) => {
    setAreas((prev) =>
        prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  // ---------- CEP: busca cidade/UF no ViaCEP ----------
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

  // ---------- Fotos ----------
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

  // ---------- IA (stub, a gente liga depois) ----------
  const handleRewrite = async () => {
    if (description.trim().length < 10) {
      Alert.alert(
          "Descrição curta",
          "Escreva um pouco mais antes de transformar.",
      );
      return;
    }

    setRewriting(true);
    try {
      // TODO: chamar a Cloud Function / backend que reescreve a descrição
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Em breve", "A reescrita com IA será conectada em breve.");
    } finally {
      setRewriting(false);
    }
  };

  // ---------- Publicar ----------
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || areas.length === 0) {
      Alert.alert("Campos obrigatórios", "Preencha título, área e descrição.");
      return;
    }
    if (!professionId) {
      Alert.alert("Profissão", "Selecione a profissão desejada.");
      return;
    }
    if (cep.length !== 8) {
      Alert.alert("CEP", "Informe um CEP válido.");
      return;
    }

    // TODO: salvar no Firestore + subir fotos no Storage
    console.log({
      title,
      areas,
      professionId,
      description,
      cep,
      location,
      deadline,
      photos,
    });
    Alert.alert("Pronto", "Serviço pronto para ser salvo (mock).");
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
            <Text style={styles.title}>Cadastrar serviço</Text>

            {/* Título */}
            <Text style={styles.label}>Título</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex.: Troca de fiação da cozinha"
                placeholderTextColor="#9C9C9C"
            />

            {/* Área de atuação (tags) */}
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
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                      >
                        {area}
                      </Text>
                    </Pressable>
                );
              })}
            </View>

            {/* Profissão desejada (escolha única) */}
            <Text style={styles.label}>Profissão desejada</Text>
            <View style={styles.chipsRow}>
              {Object.entries(namesById).map(([id, name]) => {
                const selected = professionId === id;
                return (
                    <Pressable
                        key={id}
                        onPress={() => setProfessionId(selected ? null : id)}
                        style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                      >
                        {formatProfessionName(name)}
                      </Text>
                    </Pressable>
                );
              })}
            </View>

            {/* Descrição + botão de IA */}
            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva o que você precisa..."
                placeholderTextColor="#9C9C9C"
                multiline
                textAlignVertical="top"
            />
            <Pressable
                style={styles.rewriteButton}
                onPress={handleRewrite}
                disabled={rewriting}
            >
              {rewriting ? (
                  <ActivityIndicator />
              ) : (
                  <Text style={styles.rewriteText}>✨ Transformar</Text>
              )}
            </Pressable>

            {/* CEP */}
            <Text style={styles.label}>CEP</Text>
            <TextInput
                style={styles.input}
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="number-pad"
                maxLength={8}
                placeholder="00000000"
                placeholderTextColor="#9C9C9C"
            />
            {!!location && <Text style={styles.hint}>{location}</Text>}

            {/* Prazo */}
            <Text style={styles.label}>Prazo desejado</Text>
            <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
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

            {/* Fotos */}
            <Text style={styles.label}>
              Fotos ({photos.length}/{MAX_PHOTOS})
            </Text>
            <View style={styles.chipsRow}>
              {photos.map((uri) => (
                  <Pressable
                      key={uri}
                      onPress={() => removePhoto(uri)}
                      accessibilityLabel="Remover foto"
                  >
                    <Image
                        source={{ uri }}
                        style={styles.photo}
                        contentFit="cover"
                    />
                  </Pressable>
              ))}
              {photos.length < MAX_PHOTOS && (
                  <Pressable
                      style={[styles.photo, styles.addPhoto]}
                      onPress={pickPhotos}
                  >
                    <Text style={styles.addPhotoText}>+</Text>
                  </Pressable>
              )}
            </View>
            {photos.length > 0 && (
                <Text style={styles.hint}>Toque numa foto para removê-la.</Text>
            )}

            {/* Publicar */}
            <View style={styles.submitWrapper}>
              <GradientButton
                  label="Publicar serviço"
                  colors={GRADIENT}
                  onPress={handleSubmit}
              />
            </View>
          </ScrollView>

          <BottomNavBar activeTab="add" onTabPress={handleTabPress} />
        </View>
      </SafeAreaView>
  );
}