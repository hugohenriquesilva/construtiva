import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
    LayoutAnimation,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FAQ_TOPICS, FaqQuestion } from "@/src/constants/faq";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./FaqScreen.styles";

const ICON_COLOR = "#5B69A3";

// Busca sem diferenciar maiúsculas nem acentos ("orcamento" encontra "orçamento")
function normalize(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function FaqItem({ item, topicLabel }: { item: FaqQuestion; topicLabel?: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={item.question}
            style={styles.questionCard}
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setExpanded((value) => !value);
            }}
        >
            <View style={styles.questionHeader}>
                <View style={styles.questionTextWrapper}>
                    {!!topicLabel && <Text style={styles.questionTopic}>{topicLabel}</Text>}
                    <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#9A9A9A" />
            </View>
            {expanded && <Text style={styles.answerText}>{item.answer}</Text>}
        </Pressable>
    );
}

export default function FaqScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, "PerguntasFrequentes">>();
    const topic = FAQ_TOPICS.find(({ id }) => id === route.params?.topicId) ?? null;
    const [search, setSearch] = useState("");

    // Resultados da busca em todos os tópicos (pergunta ou resposta)
    const results = useMemo(() => {
        const query = normalize(search);
        if (!query) return [];
        return FAQ_TOPICS.flatMap((faqTopic) =>
            faqTopic.questions
                .filter(({ question, answer }) =>
                    normalize(question).includes(query) || normalize(answer).includes(query))
                .map((item) => ({ item, topicTitle: faqTopic.title })),
        );
    }, [search]);

    const renderHeader = (title: string) => (
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
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
    );

    // Tópico aberto: lista de perguntas daquele tópico
    if (topic) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <StatusBar barStyle="dark-content" />
                {renderHeader("Perguntas frequentes")}
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.topicIntro}>
                        <View style={styles.topicIconLarge}>
                            <MaterialCommunityIcons name={topic.icon} size={26} color={ICON_COLOR} />
                        </View>
                        <View style={styles.topicIntroText}>
                            <Text style={styles.topicIntroTitle}>{topic.title}</Text>
                            <Text style={styles.topicIntroDescription}>{topic.description}</Text>
                        </View>
                    </View>

                    <View style={styles.questionList}>
                        {topic.questions.map((item) => (
                            <FaqItem key={item.question} item={item} />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <StatusBar barStyle="dark-content" />
            {renderHeader("")}
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="chat-question-outline" size={30} color={ICON_COLOR} />
                    </View>
                    <View style={styles.heroText}>
                        <Text style={styles.title}>Perguntas frequentes</Text>
                        <Text style={styles.subtitle}>
                            Encontre respostas para as dúvidas mais comuns sobre o Construtiva.
                        </Text>
                    </View>
                </View>

                <View style={styles.searchRow}>
                    <Feather name="search" size={18} color="#9A9A9A" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar uma dúvida..."
                        placeholderTextColor="#9A9A9A"
                        value={search}
                        onChangeText={setSearch}
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {!!search && (
                        <Pressable accessibilityLabel="Limpar busca" hitSlop={10} onPress={() => setSearch("")}>
                            <Feather name="x" size={18} color="#9A9A9A" />
                        </Pressable>
                    )}
                </View>

                {search.trim() ? (
                    results.length > 0 ? (
                        <View style={styles.questionList}>
                            {results.map(({ item, topicTitle }) => (
                                <FaqItem key={item.question} item={item} topicLabel={topicTitle} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Nenhuma dúvida encontrada</Text>
                            <Text style={styles.emptyText}>Tente outras palavras ou navegue pelos tópicos.</Text>
                        </View>
                    )
                ) : (
                    <View style={styles.topicList}>
                        {FAQ_TOPICS.map((faqTopic) => (
                            <Pressable
                                key={faqTopic.id}
                                accessibilityRole="button"
                                accessibilityLabel={faqTopic.title}
                                style={({ pressed }) => [styles.topicCard, pressed && styles.topicCardPressed]}
                                onPress={() => navigation.push("PerguntasFrequentes", { topicId: faqTopic.id })}
                            >
                                <View style={styles.topicIcon}>
                                    <MaterialCommunityIcons name={faqTopic.icon} size={24} color={ICON_COLOR} />
                                </View>
                                <View style={styles.topicText}>
                                    <Text style={styles.topicTitle}>{faqTopic.title}</Text>
                                    <Text style={styles.topicDescription}>{faqTopic.description}</Text>
                                </View>
                                <Feather name="chevron-right" size={20} color="#9A9A9A" />
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}