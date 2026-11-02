import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/firebaseConfig";
import BottomNavBar from "@/src/components/BottomNavBar/BottomNavBar";
import ServiceCard from "@/src/components/ServiceCard/ServiceCard";
import { listServicesByOwner, ServiceDocument } from "@/src/services/serviceService";
import {
  filterServicesByStatus,
  ServiceStatusFilter,
} from "@/src/services/serviceManagementRules";
import EmptyStateMessage from "@/src/components/EmptyStateMessage/EmptyStateMessage";
import { BottomTabKey } from "../../../types/home";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./MyServicesScreen.styles";

export default function MyServicesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      setServices([]);

      const loadServices = async () => {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("Usuário não autenticado.");

          const result = await listServicesByOwner(uid);
          if (active) setServices(result);
        } catch (loadError) {
          console.error(
            `Erro ao carregar serviços do proprietário (tentativa ${retryCount + 1}):`,
            loadError,
          );
          if (active) setError(true);
        } finally {
          if (active) setLoading(false);
        }
      };

      void loadServices();
      return () => {
        active = false;
      };
    }, [retryCount]),
  );

  const visibleServices = useMemo(
    () => filterServicesByStatus(services, statusFilter),
    [services, statusFilter],
  );
  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") navigation.navigate("Home");
    else if (tab === "professional") navigation.navigate("BuscaPortfolio");
    else if (tab === "services") navigation.navigate("BuscaServicos");
    else if (tab === "menu") navigation.navigate("MaisInformacoes");
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#5B69A3" />
          <Text style={styles.stateText}>Carregando seus serviços...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Não foi possível carregar seus serviços.</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={() => setRetryCount((count) => count + 1)}
          >
            <Text style={styles.actionText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    if (services.length === 0) {
      return (
        <EmptyStateMessage
          title="Você ainda não publicou nenhum serviço!"
          description="Que tal começar agora? Publique seu primeiro serviço e receba propostas de profissionais."
          mascotSource={require("../../../assets/images/deuCertoSemFala.png")}
          actionLabel="Cadastrar serviço"
          onAction={() => navigation.navigate("CadastrarServico")}
        />
      );
    }

    const emptyTitle = statusFilter === "open"
      ? "Nenhum serviço aberto!"
      : "Nenhum serviço encerrado!";
    const emptyDescription = statusFilter === "open"
      ? "Você não tem serviços abertos no momento."
      : "Você ainda não tem serviços encerrados.";

    return (
      <EmptyStateMessage
        title={emptyTitle}
        description={emptyDescription}
        mascotSource={require("../../../assets/images/deuCertoSemFala.png")}
        actionLabel={statusFilter === "open" ? "Cadastrar serviço" : undefined}
        onAction={
          statusFilter === "open"
            ? () => navigation.navigate("CadastrarServico")
            : undefined
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={22} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.title}>Meus serviços</Text>
        </View>

        <View style={styles.filters}>
          {(["open", "closed"] as const).map((status) => {
            const selected = statusFilter === status;
            const label = status === "open" ? "Abertos" : "Encerrados";
            return (
              <Pressable
                key={status}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={[styles.filterButton, selected && styles.filterButtonSelected]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={visibleServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={(service) =>
                navigation.navigate("DetalhesServico", { serviceId: service.id })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </View>
      <BottomNavBar
        activeTab="add"
        onTabPress={handleTabPress}
        onAddPress={() => navigation.navigate("Adicionar")}
      />
    </SafeAreaView>
  );
}
