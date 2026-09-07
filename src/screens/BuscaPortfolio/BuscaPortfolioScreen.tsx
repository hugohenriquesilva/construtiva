import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "@/firebaseConfig";
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

  // Busca conforme o usuário digita (com debounce), usando o geohash do cliente
  useEffect(() => {
    const profession = searchQuery.trim();

    if (!profession || !userGeohash) {
      setResults([]);
      setEmptyMessage(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      const response = await searchProfessionalsByGeoHash(
        profession,
        userGeohash,
      );
      setResults(response.results);
      setEmptyMessage(
        response.results.length === 0 ? (response.message ?? null) : null,
      );
      setSearching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, userGeohash]);

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
    const occupations = [
      item.mainProfession,
      ...item.secondaryProfessions,
    ].filter(Boolean);

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
            onChangeText={setSearchQuery}
          />
          {searching && <ActivityIndicator size="small" color="#9C9C9C" />}
        </View>

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
      </View>

      <BottomNavBar
        activeTab="professional"
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate("Adicionar")}
      />
    </SafeAreaView>
  );
}
