import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/firebaseConfig";
import { SERVICE_AREAS } from "@/src/constants/serviceAreas";
import BottomNavBar from "@/src/components/BottomNavBar/BottomNavBar";
import ServiceCard from "@/src/components/ServiceCard/ServiceCard";
import { useProfessions } from "@/src/hooks/useProfessions";
import { getPortfolio, PortfolioData } from "@/src/services/portfolioService";
import { Coordinates, getProfessionalLocation } from "@/src/services/locationService";
import { listOpenServices, ServiceDocument } from "@/src/services/serviceService";
import { formatProfessionName } from "@/src/utils/formatProfessionName";
import { filterServices, rankServicesByDistance } from "@/src/utils/filterServices";
import { hasValidCoordinates } from "@/src/utils/proximity";
import { matchProfessions } from "@/src/utils/matchProfessions";
import { professionDuplicateKey } from "@/src/services/professionService";
import EmptyStateMessage from "@/src/components/EmptyStateMessage/EmptyStateMessage";
import { BottomTabKey } from "../../../types/home";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./BuscaServicosScreen.styles";

type SearchOption =
  | { type: "profession"; id: string; label: string }
  | { type: "area"; id: string; label: string };

function getProfessionIds(portfolio: PortfolioData): string[] {
  return [...new Set([
    portfolio.mainProfessionId,
    ...(portfolio.secondaryProfessionIds ?? []),
  ].filter((id): id is string => typeof id === "string" && id.length > 0))];
}

// Mesmo valor padrão do raio de atuação no formulário do portfólio
const DEFAULT_RADIUS_KM = 20;

function resolveRadiusKm(...values: unknown[]): number {
  const radius = values.find((value): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0);
  return radius ?? DEFAULT_RADIUS_KM;
}


function normalizeText(value: string): string {
  return professionDuplicateKey(value).toLocaleLowerCase("pt-BR");
}

export default function BuscaServicosScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { professions } = useProfessions();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [allServices, setAllServices] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(null);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const renderNoResults = (title: string, description: string, showClear = false) => (
    <EmptyStateMessage
      title={title}
      description={description}
      mascotSource={require("../../../assets/images/chateado.png")}
      mascotAspectRatio={1102 / 960}
      actionLabel={showClear ? "Limpar pesquisa" : undefined}
      onAction={showClear ? clearSearch : undefined}
      actionVariant="link"
    />
  );

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setServices([]);

    const loadServices = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Usuário não autenticado");

        const [currentPortfolio, location] = await Promise.all([
          getPortfolio(uid),
          getProfessionalLocation(uid),
        ]);
        if (!active) return;
        setPortfolio(currentPortfolio);
        setOrigin(hasValidCoordinates(location) ? location : null);
        setRadiusKm(resolveRadiusKm(currentPortfolio?.radiusKm, location?.radiusKm));

        if (!currentPortfolio?.isActive || !hasValidCoordinates(location)) {
          setLoading(false);
          return;
        }

        const result = await listOpenServices();
        if (!active) return;
        setServices(result);
      } catch (loadError) {
        console.error(`Erro ao carregar serviços (tentativa ${retryCount + 1}):`, loadError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadServices();
    return () => { active = false; };
  }, [retryCount]));

  const suggestions = useMemo<SearchOption[]>(() => {
    if (!searchText.trim() || selectedOption) return [];

    const professionOptions = matchProfessions(searchText, professions)
      .slice(0, 8)
      .map(({ profession }) => ({
        type: "profession" as const,
        id: profession.id,
        label: formatProfessionName(profession.name),
      }));
    const areaQuery = normalizeText(searchText);
    const areaOptions = SERVICE_AREAS
      .filter((area) => normalizeText(area).includes(areaQuery))
      .slice(0, 8)
      .map((area) => ({ type: "area" as const, id: area, label: area }));

    return [...professionOptions, ...areaOptions].slice(0, 8);
  }, [professions, searchText, selectedOption]);

  const portfolioProfessionIds = useMemo(
    () => portfolio ? getProfessionIds(portfolio) : [],
    [portfolio],
  );
  const currentUserUid = auth.currentUser?.uid;

  const visibleServices = useMemo(
    () => !origin || (searchText.trim() && !selectedOption)
      ? []
      : rankServicesByDistance(
        filterServices(
          services,
          portfolioProfessionIds,
          allServices,
          selectedOption,
          currentUserUid,
        ),
        origin,
        radiusKm,
        allServices,
        portfolio?.mainProfessionId,
      ),
    [allServices, currentUserUid, origin, portfolio, portfolioProfessionIds, radiusKm, searchText, selectedOption, services],
  );

  const handleSelectOption = (option: SearchOption) => {
    setSelectedOption(option);
    setSearchText(option.label);
  };

  const clearSearch = () => {
    setSearchText("");
    setSelectedOption(null);
  };

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") navigation.navigate("Home");
    else if (tab === "professional") navigation.navigate("BuscaPortfolio");
    else if (tab === "services") return;
    else if (tab === "menu") navigation.navigate("MaisInformacoes");
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color="#5B69A3" />
          <Text style={styles.messageText}>
            Estamos buscando serviços que combinam com seu perfil, considerando suas profissões e sua área de atuação. Aguarde um momentinho! 🔎
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Não foi possível carregar os serviços.</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => setRetryCount((count) => count + 1)}
          >
            <Text style={styles.actionButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }
    if (!portfolio?.isActive) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Ative seu portfólio profissional</Text>
          <Text style={styles.messageText}>
            A busca de serviços está disponível para profissionais com portfólio ativo.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => navigation.navigate("FormularioProfissional")}
          >
            <Text style={styles.actionButtonText}>Acessar meu portfólio</Text>
          </Pressable>
        </View>
      );
    }
    if (!origin) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Informe seu CEP de atuação</Text>
          <Text style={styles.messageText}>
            Precisamos do CEP de atuação do seu portfólio para mostrar os serviços dentro do seu raio de atendimento.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => navigation.navigate("FormularioProfissional")}
          >
            <Text style={styles.actionButtonText}>Atualizar portfólio</Text>
          </Pressable>
        </View>
      );
    }
    if (searchText.trim() && !selectedOption) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Selecione uma profissão ou área nas sugestões para filtrar os serviços.
          </Text>
        </View>
      );
    }
    if (!allServices && (!portfolio.mainProfessionId || getProfessionIds(portfolio).length === 0)) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Complete suas profissões</Text>
          <Text style={styles.messageText}>
            Cadastre uma profissão principal para encontrar serviços compatíveis, ou ative “Exibir todos os serviços”.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => navigation.navigate("FormularioProfissional")}
          >
            <Text style={styles.actionButtonText}>Completar portfólio</Text>
          </Pressable>
        </View>
      );
    }
    if (selectedOption) {
      return renderNoResults(
        "Nenhum resultado encontrado!",
        "Tente selecionar outra profissão ou área.",
        true,
      );
    }
    return allServices
      ? renderNoResults(
        "Nenhum serviço disponível!",
        "Ainda não há serviços abertos para exibir.",
      )
      : renderNoResults(
        "Nenhum serviço encontrado!",
        `Não há serviços das suas profissões em até ${radiusKm} km. Ative “Exibir todos os serviços” para explorar outras oportunidades.`,
      );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Feather name="tool" size={21} color="#1A1A1A" />
          <Text style={styles.headerTitle}>Buscar serviços</Text>
        </View>

        <View style={styles.searchRow}>
          <Feather name="search" size={16} color="#9C9C9C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profissão ou área"
            placeholderTextColor="#9C9C9C"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setSelectedOption(null);
            }}
            autoCorrect={false}
            returnKeyType="done"
          />
          {!!searchText && (
            <Pressable accessibilityLabel="Limpar busca" hitSlop={10} onPress={clearSearch}>
              <Feather name="x" size={17} color="#9C9C9C" />
            </Pressable>
          )}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((option) => (
              <Pressable
                key={`${option.type}:${option.id}`}
                style={styles.suggestionItem}
                onPress={() => handleSelectOption(option)}
              >
                <Feather
                  name={option.type === "profession" ? "briefcase" : "tag"}
                  size={15}
                  color="#777777"
                />
                <Text style={styles.suggestionText}>{option.label}</Text>
                <Text style={styles.suggestionType}>
                  {option.type === "profession" ? "Profissão" : "Área"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>Exibir todos os serviços</Text>
          </View>
          <Switch
            value={allServices}
            onValueChange={setAllServices}
            trackColor={{ false: "#D5D5D5", true: "#AEB8E0" }}
            thumbColor={allServices ? "#5B69A3" : "#FFFFFF"}
            accessibilityLabel="Exibir todos os serviços"
          />
        </View>

        <FlatList
          data={visibleServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              distanceKm={item.distanceKm}
              onPress={(service) => navigation.navigate("DetalhesServico", { serviceId: service.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
      <BottomNavBar
        activeTab="services"
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate("Adicionar")}
      />
    </SafeAreaView>
  );
}
