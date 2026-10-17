import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "@/firebaseConfig";
import { useProfessions } from "@/src/hooks/useProfessions";
import { Profession } from "@/src/services/professionService";
import { formatProfessionName } from "@/src/utils/formatProfessionName";
import { matchProfessions, ProfessionMatch } from "@/src/utils/matchProfessions";
import { getClientLocation } from "@/src/services/locationService";
import {
  ProfessionalSearchResult,
  searchProfessionalsByGeoHash,
} from "@/src/services/searchService";
import { BottomTabKey } from "../../../types/home";
import { RootStackParamList } from "../../../types/navigation";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import { styles } from "./BuscaPortfolioScreen.styles";

export default function BuscaPortfolioScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [userGeohash, setUserGeohash] = useState<string | null>(null);
  const [results, setResults] = useState<ProfessionalSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  // A busca só roda para uma profissão escolhida na lista de sugestões, nunca pelo texto digitado
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const {
    professions,
    loading: professionsLoading,
    error: professionsError,
  } = useProfessions();
  // Evita que a resposta de uma busca antiga sobrescreva a da seleção mais recente
  const searchRequestId = useRef(0);

  const suggestions = useMemo(
    () => (selectedProfession ? [] : matchProfessions(searchQuery, professions)),
    [searchQuery, professions, selectedProfession],
  );

  // Se o cliente ainda não cadastrou o CEP, avisa e leva para o cadastro.
  // Aproveita para carregar o geohash do cliente, usado na busca.
  useFocusEffect(
    useCallback(() => {
      const checkLocation = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists() && userSnap.data().location === true) {
          const clientLocation = await getClientLocation(uid);
          setUserGeohash(clientLocation?.geohash ?? null);
          return;
        }

        Alert.alert(
          "CEP não cadastrado",
          "Você ainda não possui um CEP cadastrado. Cadastre seu CEP para encontrar profissionais próximos a você",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("MaisInformacoes", { focusCep: true }),
            },
          ],
          { cancelable: false },
        );
      };

      checkLocation();
    }, [navigation]),
  );

  const resetSearch = () => {
    searchRequestId.current += 1;
    setSelectedProfession(null);
    setResults([]);
    setEmptyMessage(null);
    setSearching(false);
  };

  // Ao voltar a digitar depois de escolher, a seleção e os resultados são descartados
  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    if (selectedProfession) resetSearch();
  };

  const handleClear = () => {
    setSearchQuery("");
    resetSearch();
  };

  const handleSelectProfession = async (profession: Profession) => {
    Keyboard.dismiss();
    setSelectedProfession(profession);
    setSearchQuery(formatProfessionName(profession.name));
    setResults([]);

    if (!userGeohash) {
      setEmptyMessage(
        "Cadastre seu CEP para encontrar profissionais próximos a você.",
      );
      return;
    }

    const requestId = ++searchRequestId.current;
    setSearching(true);
    setEmptyMessage(null);

    const response = await searchProfessionalsByGeoHash(
      profession.name,
      userGeohash,
    );
    if (requestId !== searchRequestId.current) return;

    setResults(response.results);
    setEmptyMessage(
      response.results.length === 0 ? (response.message ?? null) : null,
    );
    setSearching(false);
  };

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") {
      navigation.navigate("Home");
    } else if (tab === "professional") {
      // já está na tela de busca, não faz nada
    } else if (tab === "menu") {
      navigation.navigate("MaisInformacoes");
    }
  };

  const renderItem = ({ item }: { item: ProfessionalSearchResult }) => {
    const occupations = [item.mainProfession, ...item.secondaryProfessions]
      .filter(Boolean)
      .map(formatProfessionName);

    return (
      <View style={styles.resultCard}>
        <View style={styles.avatar}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={22} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.resultInfo}>
          {item.hasCnpj && (
            <View style={styles.cnpjBadge}>
              <Text style={styles.cnpjStar}>★</Text>
              <Text style={styles.cnpjText}>Com CNPJ</Text>
            </View>
          )}
          <Text style={styles.resultName}>{item.displayName}</Text>
          <Text style={styles.resultOccupation}>{occupations.join(" | ")}</Text>
          <Text style={styles.resultDescription} numberOfLines={2}>
            {item.aboutMe}
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate("PortfolioProfissional", {
              hideBackButton: false,
              professionalUid: item.uid,
            })
          }
        >
          <Text style={styles.profileButtonText}>Perfil</Text>
        </Pressable>
      </View>
    );
  };

  // Destaca em negrito o trecho que combinou com o texto digitado ("**Pin**tor")
  const renderSuggestion = ({ item }: { item: ProfessionMatch }) => {
    const name = formatProfessionName(item.profession.name);
    const matchEnd = item.matchStart + item.matchLength;

    return (
      <Pressable
        style={styles.suggestionItem}
        onPress={() => handleSelectProfession(item.profession)}
      >
        <Feather name="search" size={14} color="#9C9C9C" />
        <Text style={styles.suggestionText}>
          {name.slice(0, item.matchStart)}
          <Text style={styles.suggestionMatch}>
            {name.slice(item.matchStart, matchEnd)}
          </Text>
          {name.slice(matchEnd)}
        </Text>
      </Pressable>
    );
  };

  const suggestionsEmptyMessage = () => {
    if (!searchQuery.trim()) return null;
    if (professionsLoading) return "Carregando profissões...";
    if (professionsError) return "Não foi possível carregar as profissões.";
    return `Nenhuma profissão encontrada para "${searchQuery.trim()}".`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Feather name="search" size={20} color="#1A1A1A" />
          <Text style={styles.headerTitle}>Buscar profissionais</Text>
        </View>

        <View style={styles.searchRow}>
          <Feather name="search" size={16} color="#9C9C9C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar tipo de profissional"
            placeholderTextColor="#9C9C9C"
            value={searchQuery}
            onChangeText={handleChangeText}
            autoCorrect={false}
            returnKeyType="done"
          />
          {searching && <ActivityIndicator size="small" color="#9C9C9C" />}
          {!!searchQuery && !searching && (
            <Pressable
              accessibilityLabel="Limpar busca"
              hitSlop={10}
              onPress={handleClear}
            >
              <Feather name="x" size={16} color="#9C9C9C" />
            </Pressable>
          )}
        </View>

        {selectedProfession ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.uid}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              emptyMessage ? (
                <Text style={styles.emptyMessage}>{emptyMessage}</Text>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.profession.id}
            renderItem={renderSuggestion}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              suggestionsEmptyMessage() ? (
                <Text style={styles.emptyMessage}>
                  {suggestionsEmptyMessage()}
                </Text>
              ) : null
            }
          />
        )}
      </View>

      <BottomNavBar
        activeTab="professional"
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate("Adicionar")}
      />
    </SafeAreaView>
  );
}
