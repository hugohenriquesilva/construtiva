import { useCallback, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { auth } from "@/firebaseConfig";
import { getPortfolio } from "@/src/services/portfolioService";
import { RootStackParamList } from "../../../types/navigation";
import { BottomTabKey } from "../../../types/home";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import { styles } from "./AddOptionsScreen.styles";

function showMockAction(title: string) {
  Alert.alert(
    title,
    "Esta ação será conectada à funcionalidade correspondente em breve.",
  );
}

export default function AddOptionsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [portfolioActive, setPortfolioActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadPortfolioStatus = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const portfolio = await getPortfolio(uid);
        setPortfolioActive(portfolio?.isActive ?? false);
      };

      loadPortfolioStatus();
    }, []),
  );

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") {
      navigation.navigate("Home");
    } else if (tab === "professional") {
      navigation.navigate("BuscaPortfolio");
    } else if (tab === "menu") {
      navigation.navigate("MaisInformacoes");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Adicionar</Text>

          <View style={styles.optionList}>
            <View style={styles.portfolioRow}>
              <Pressable
                style={[styles.optionButton, styles.portfolioOption]}
                onPress={() =>
                  navigation.navigate(
                    portfolioActive ? "PortfolioProfissional" : "FormularioProfissional",
                  )
                }
              >
                <Text style={styles.optionLabel}>Meu portfólio</Text>
                <Text
                  style={[
                    styles.badge,
                    portfolioActive ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  {portfolioActive ? "Ativo" : "Inativo"}
                </Text>
              </Pressable>

              {portfolioActive && (
                <Pressable
                  accessibilityLabel="Editar meu portfólio"
                  style={styles.editButton}
                  onPress={() => navigation.navigate("FormularioProfissional")}
                >
                  <Feather name="edit-2" size={20} color="#FFFFFF" />
                </Pressable>
              )}
            </View>

            <Pressable
              style={styles.optionButton}
              onPress={() => showMockAction("Cadastrar serviço")}
            >
              <Text style={styles.optionLabel}>Cadastrar serviço</Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomNavBar activeTab="add" onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
}
