import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { auth } from "@/firebaseConfig";
import { useProfessions } from "@/src/hooks/useProfessions";
import { getUserRole } from "@/src/services/portfolioService";
import {
    listReportedProfiles,
    listReportedServices,
    ReportedProfile,
    ReportedService,
} from "@/src/services/reportService";
import { formatProfessionName } from "@/src/utils/formatProfessionName";
import { RootStackParamList } from "../../../types/navigation";
import { styles as cardStyles } from "../BuscaPortfolio/BuscaPortfolioScreen.styles";
import { styles as adminStyles } from "../ProfessionsAdmin/ProfessionsAdminScreen.styles";
import { styles } from "./ReportsAdminScreen.styles";

type ReportsTab = "profiles" | "services";

export default function ReportsAdminScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { namesById } = useProfessions();
    const [tab, setTab] = useState<ReportsTab>("profiles");
    const [profiles, setProfiles] = useState<ReportedProfile[]>([]);
    const [services, setServices] = useState<ReportedService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Só carrega as denúncias depois de confirmar que é admin
    // (a garantia real está nas regras do Firestore, que bloqueiam a leitura para os demais)
    const loadReports = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const uid = auth.currentUser?.uid;
            const role = uid ? await getUserRole(uid) : null;
            if (role !== "admin") {
                Alert.alert("Acesso negado", "Esta área é exclusiva para administradores.");
                navigation.goBack();
                return;
            }

            // As duas abas carregam juntas, para a troca de aba ser imediata
            const [reportedProfiles, reportedServices] = await Promise.all([
                listReportedProfiles(),
                listReportedServices(),
            ]);
            setProfiles(reportedProfiles);
            setServices(reportedServices);
        } catch (e) {
            console.error("Erro ao carregar denúncias:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    // Recarrega ao voltar do perfil ou do serviço, para refletir exclusões
    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [loadReports]),
    );

    const renderCount = (reportsCount: number) => (
        <View style={styles.countBadge}>
            <Feather name="flag" size={13} color="#B3261E" />
            <Text style={styles.countText}>
                {reportsCount} {reportsCount === 1 ? "denúncia" : "denúncias"}
            </Text>
        </View>
    );

    const renderServiceItem = ({ item }: { item: ReportedService }) => {
        const service = item.service;
        const details = service
            ? [
                service.professionId ? formatProfessionName(namesById[service.professionId] ?? "") : "",
                ...service.areas,
            ].filter(Boolean)
            : [];

        return (
            <Pressable
                style={cardStyles.resultCard}
                disabled={!service}
                accessibilityLabel={`Ver serviço ${service?.title ?? item.serviceTitle}`}
                onPress={() => navigation.navigate("DetalhesServico", { serviceId: item.serviceId })}
            >
                <View style={[cardStyles.avatar, styles.serviceThumb]}>
                    {service?.photos[0] ? (
                        <Image source={{ uri: service.photos[0] }} style={cardStyles.avatarImage} />
                    ) : (
                        <Feather name="tool" size={22} color="#FFFFFF" />
                    )}
                </View>

                <View style={cardStyles.resultInfo}>
                    {service?.status !== undefined && service.status !== "open" && (
                        <Text style={styles.closedText}>Encerrado</Text>
                    )}
                    <Text style={cardStyles.resultName}>
                        {service?.title || item.serviceTitle || "Serviço sem título"}
                    </Text>
                    {details.length > 0 && (
                        <Text style={cardStyles.resultOccupation}>{details.join(" | ")}</Text>
                    )}
                    {service ? (
                        !!service.location && (
                            <Text style={cardStyles.resultDescription} numberOfLines={2}>
                                {service.location}
                            </Text>
                        )
                    ) : (
                        <Text style={styles.deletedText}>Serviço excluído</Text>
                    )}
                </View>

                {renderCount(item.reportsCount)}
            </Pressable>
        );
    };

    const renderItem = ({ item }: { item: ReportedProfile }) => {
        const portfolio = item.portfolio;
        const occupations = portfolio
            ? [portfolio.mainProfessionId, ...(portfolio.secondaryProfessionIds ?? [])]
                .map((id) => (id ? namesById[id] : undefined))
                .filter((name): name is string => !!name)
                .map(formatProfessionName)
            : [];

        return (
            <Pressable
                style={cardStyles.resultCard}
                disabled={!portfolio}
                accessibilityLabel={`Ver perfil de ${portfolio?.displayName ?? item.professionalName}`}
                onPress={() =>
                    navigation.navigate("PortfolioProfissional", {
                        hideBackButton: false,
                        professionalUid: item.professionalUid,
                    })
                }
            >
                <View style={cardStyles.avatar}>
                    {portfolio?.photoUri ? (
                        <Image source={{ uri: portfolio.photoUri }} style={cardStyles.avatarImage} />
                    ) : (
                        <Feather name="user" size={22} color="#FFFFFF" />
                    )}
                </View>

                <View style={cardStyles.resultInfo}>
                    {portfolio?.hasCnpj && (
                        <View style={cardStyles.cnpjBadge}>
                            <Text style={cardStyles.cnpjStar}>★</Text>
                            <Text style={cardStyles.cnpjText}>Com CNPJ</Text>
                        </View>
                    )}
                    <Text style={cardStyles.resultName}>
                        {portfolio?.displayName ?? item.professionalName}
                    </Text>
                    {occupations.length > 0 && (
                        <Text style={cardStyles.resultOccupation}>{occupations.join(" | ")}</Text>
                    )}
                    {portfolio ? (
                        <Text style={cardStyles.resultDescription} numberOfLines={2}>
                            {portfolio.aboutMe}
                        </Text>
                    ) : (
                        <Text style={styles.deletedText}>Perfil excluído</Text>
                    )}
                </View>

                {renderCount(item.reportsCount)}
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={adminStyles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={adminStyles.screen}>
                <View style={adminStyles.header}>
                    <Pressable
                        accessibilityLabel="Voltar"
                        hitSlop={12}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={26} color="#111111" />
                    </Pressable>
                    <Text style={adminStyles.title}>Denúncias</Text>
                </View>

                <View style={styles.tabs} accessibilityRole="tablist">
                    {([
                        { key: "profiles", label: "Profissionais", count: profiles.length },
                        { key: "services", label: "Serviços", count: services.length },
                    ] as const).map((option) => (
                        <Pressable
                            key={option.key}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: tab === option.key }}
                            style={[styles.tab, tab === option.key && styles.tabActive]}
                            onPress={() => setTab(option.key)}
                        >
                            <Text style={[styles.tabText, tab === option.key && styles.tabTextActive]}>
                                {option.label}{loading ? "" : ` (${option.count})`}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 24 }} />
                ) : error ? (
                    <View>
                        <Text style={adminStyles.emptyMessage}>
                            Não foi possível carregar as denúncias.
                        </Text>
                        <Pressable onPress={loadReports}>
                            <Text style={styles.retryText}>Tentar novamente</Text>
                        </Pressable>
                    </View>
                ) : tab === "profiles" ? (
                    <FlatList
                        data={profiles}
                        keyExtractor={(item) => item.professionalUid}
                        renderItem={renderItem}
                        contentContainerStyle={adminStyles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={adminStyles.separator} />}
                        ListEmptyComponent={
                            <Text style={adminStyles.emptyMessage}>Nenhum perfil denunciado.</Text>
                        }
                    />
                ) : (
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.serviceId}
                        renderItem={renderServiceItem}
                        contentContainerStyle={adminStyles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={adminStyles.separator} />}
                        ListEmptyComponent={
                            <Text style={adminStyles.emptyMessage}>Nenhum serviço denunciado.</Text>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}