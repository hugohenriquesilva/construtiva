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
import { listReportedProfiles, ReportedProfile } from "@/src/services/reportService";
import { formatProfessionName } from "@/src/utils/formatProfessionName";
import { RootStackParamList } from "../../../types/navigation";
import { styles as cardStyles } from "../BuscaPortfolio/BuscaPortfolioScreen.styles";
import { styles as adminStyles } from "../ProfessionsAdmin/ProfessionsAdminScreen.styles";
import { styles } from "./ReportsAdminScreen.styles";

export default function ReportsAdminScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { namesById } = useProfessions();
    const [profiles, setProfiles] = useState<ReportedProfile[]>([]);
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

            setProfiles(await listReportedProfiles());
        } catch (e) {
            console.error("Erro ao carregar denúncias:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    // Recarrega ao voltar do perfil, para refletir exclusões
    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [loadReports]),
    );

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

                <View style={styles.countBadge}>
                    <Feather name="flag" size={13} color="#B3261E" />
                    <Text style={styles.countText}>
                        {item.reportsCount} {item.reportsCount === 1 ? "denúncia" : "denúncias"}
                    </Text>
                </View>
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

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 24 }} />
                ) : (
                    <FlatList
                        data={error ? [] : profiles}
                        keyExtractor={(item) => item.professionalUid}
                        renderItem={renderItem}
                        contentContainerStyle={adminStyles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={adminStyles.separator} />}
                        ListEmptyComponent={
                            error ? (
                                <View>
                                    <Text style={adminStyles.emptyMessage}>
                                        Não foi possível carregar as denúncias.
                                    </Text>
                                    <Pressable onPress={loadReports}>
                                        <Text style={styles.retryText}>Tentar novamente</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Text style={adminStyles.emptyMessage}>
                                    Nenhum perfil denunciado.
                                </Text>
                            )
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}