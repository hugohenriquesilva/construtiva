import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LegalItem, PRIVACY_ITEMS, TERMS_ITEMS, TERMS_NOTICE } from "@/src/constants/privacyTerms";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./PrivacyTermsScreen.styles";

type LegalTab = "privacy" | "terms";

const TABS: { key: LegalTab; label: string }[] = [
    { key: "privacy", label: "Política de privacidade" },
    { key: "terms", label: "Termos de uso" },
];

function LegalCard({ item }: { item: LegalItem }) {
    return (
        <View style={styles.itemCard}>
            <View style={styles.itemIcon}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#5B69A3" />
            </View>
            <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.text}</Text>
            </View>
        </View>
    );
}

export default function PrivacyTermsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, "PrivacidadeTermos">>();
    const [tab, setTab] = useState<LegalTab>(route.params?.tab ?? "privacy");

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    hitSlop={10}
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={22} color="#1A1A1A" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Privacidade e termos de uso</Text>
                <Text style={styles.subtitle}>
                    Conheça nossas políticas e as condições de uso do Construtiva.
                </Text>

                <View style={styles.tabs} accessibilityRole="tablist">
                    {TABS.map((option) => {
                        const selected = tab === option.key;
                        return (
                            <Pressable
                                key={option.key}
                                accessibilityRole="tab"
                                accessibilityState={{ selected }}
                                style={[styles.tab, selected && styles.tabSelected]}
                                onPress={() => setTab(option.key)}
                            >
                                <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {tab === "privacy" ? (
                    <>
                        <View style={styles.itemList}>
                            {PRIVACY_ITEMS.map((item) => <LegalCard key={item.title} item={item} />)}
                        </View>
                        <Text style={styles.footnote}>
                            Para mais informações, consulte os canais de contato do Construtiva.
                        </Text>
                    </>
                ) : (
                    <>
                        <View style={styles.notice}>
                            <MaterialCommunityIcons name="alert-outline" size={24} color="#C77A2E" />
                            <View style={styles.itemText}>
                                <Text style={styles.noticeTitle}>{TERMS_NOTICE.title}</Text>
                                <Text style={styles.noticeText}>{TERMS_NOTICE.text}</Text>
                            </View>
                        </View>
                        <View style={styles.itemList}>
                            {TERMS_ITEMS.map((item) => <LegalCard key={item.title} item={item} />)}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}