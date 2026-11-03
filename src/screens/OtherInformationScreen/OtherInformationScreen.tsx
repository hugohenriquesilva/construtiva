import { auth, db } from "@/firebaseConfig";
import { logoutUser } from "@/src/services/authService";
import { cpfMask } from "@/src/utils/CpfMask";
import { getPortfolio } from "@/src/services/portfolioService";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { ReactNode, useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabKey } from "../../../types/home";
import { RootStackParamList } from "../../../types/navigation";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import DeleteAccount from "../../components/DeleteAccount/DeleteAccount";
import ChangePassword from "../../components/ChangePassword/ChangePassword";
import EditProfile from "../../components/EditProfile/EditProfile";
import { styles } from "./OtherInformationScreen.styles";

function showMockAction(title: string) {
  Alert.alert(
    title,
    "Esta ação será conectada à funcionalidade correspondente em breve.",
  );
}

type FeatherIconName = keyof typeof Feather.glyphMap;

function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  badge,
  destructive = false,
  last = false,
}: {
  icon: FeatherIconName;
  label: string;
  onPress: () => void;
  badge?: { label: string; active: boolean };
  destructive?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.menuRow, !last && styles.menuRowDivider, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <Feather name={icon} size={20} color={destructive ? "#E10B0B" : "#5B69A3"} />
      <Text style={[styles.menuLabel, destructive && styles.destructiveLabel]}>{label}</Text>
      {badge && (
        <Text style={[styles.badge, badge.active ? styles.activeBadge : styles.inactiveBadge]}>
          {badge.label}
        </Text>
      )}
      {!destructive && <Feather name="chevron-right" size={20} color="#B0B0B0" />}
    </Pressable>
  );
}

export default function OtherInformationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MaisInformacoes">>();
  const [userProfile, setUserProfile] = useState<any>(null);
  // null enquanto carrega; o selo Ativo/Inativo só aparece depois de saber o status
  const [portfolioActive, setPortfolioActive] = useState<boolean | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [focusCep, setFocusCep] = useState(false);

  // Se veio da tela de busca por falta de CEP, abre o editor já focado nele
  useFocusEffect(
    useCallback(() => {
      if (route.params?.focusCep) {
        setFocusCep(true);
        setShowEditModal(true);
        navigation.setParams({ focusCep: undefined });
      }
    }, [route.params?.focusCep, navigation]),
  );

  // Carregar perfil do usuário e status do portfólio ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const uid = auth.currentUser?.uid;
          if (uid) {
            // Dados do perfil e status do portfólio em paralelo
            const [userSnap, portfolio] = await Promise.all([
              getDoc(doc(db, "users", uid)),
              getPortfolio(uid).catch(() => null),
            ]);
            if (userSnap.exists()) {
              setUserProfile(userSnap.data());
            }
            setPortfolioActive(portfolio?.isActive ?? false);
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        }
      };

      loadData();
    }, []),
  );

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") {
      navigation.navigate("Home");
    } else if (tab === "professional") {
      navigation.navigate("BuscaPortfolio");
    } else if (tab === "services") {
      navigation.navigate("BuscaServicos");
    } else if (tab === "menu") {
      // já está na tela de menu, não faz nada
    }
  };

  async function handleSignOut() {
    try {
      // O AppNavigator troca para a tela de login sozinho quando o Firebase
      // avisa que não há mais usuário (onAuthStateChanged)
      await logoutUser();
    } catch {
      Alert.alert(
        "Erro ao sair",
        "Não foi possível encerrar a sessão. Tente novamente.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Abrir menu"
              hitSlop={12}
              onPress={() => showMockAction("Menu")}
            >
              <MaterialCommunityIcons color="#111111" name="menu" size={32} />
            </Pressable>
            <Text style={styles.title}>Outras informações</Text>
          </View>

          {userProfile && (
            <Pressable
              style={styles.profileCard}
              onPress={() => setShowEditModal(true)}
            >
              <View style={styles.avatar}>
                {userProfile?.photoUri ? (
                  <Image
                    source={{ uri: userProfile.photoUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account"
                    size={40}
                    color="#8A8D91"
                  />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile?.fullName}</Text>
                <Text style={styles.profileDetail}>
                  {userProfile?.CPF ? cpfMask(userProfile.CPF) : ""}
                </Text>
                <Text style={styles.profileDetail}>{userProfile?.email}</Text>
              </View>
            </Pressable>
          )}

          <MenuSection title="Minhas informações">
            <MenuRow icon="user" label="Editar perfil" onPress={() => setShowEditModal(true)} />
            <MenuRow icon="lock" label="Minha senha" onPress={() => setShowPasswordModal(true)} last />
          </MenuSection>

          <MenuSection title="Portfólio e serviços">
            <MenuRow
              icon="briefcase"
              label="Meu portfólio"
              badge={portfolioActive === null
                ? undefined
                : { label: portfolioActive ? "Ativo" : "Inativo", active: portfolioActive }}
              onPress={() =>
                navigation.navigate(portfolioActive ? "PortfolioProfissional" : "FormularioProfissional")
              }
            />
            <MenuRow icon="clipboard" label="Meus serviços" onPress={() => navigation.navigate("MeusServicos")} last />
          </MenuSection>

          {userProfile?.role === "admin" && (
            <MenuSection title="Administração">
              <MenuRow icon="tag" label="Edição de profissões" onPress={() => navigation.navigate("EdicaoProfissoes")} />
              <MenuRow icon="flag" label="Denúncias" onPress={() => navigation.navigate("Denuncias")} last />
            </MenuSection>
          )}

          <MenuSection title="Ajuda e privacidade">
            <MenuRow icon="help-circle" label="Perguntas frequentes" onPress={() => showMockAction("Perguntas frequentes")} />
            <MenuRow icon="shield" label="Nossa política de privacidade" onPress={() => showMockAction("Política de privacidade")} last />
          </MenuSection>

          <MenuSection title="Conta">
            <MenuRow icon="trash-2" label="Excluir conta" destructive onPress={() => setShowDeleteModal(true)} last />
          </MenuSection>

          <Pressable accessibilityRole="button" style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutLabel}>Sair</Text>
          </Pressable>
        </ScrollView>

        <BottomNavBar
          activeTab="menu"
          onTabPress={handleTabPress}
          onAddPress={() => navigation.navigate("Adicionar")}
        />
      </View>

      <EditProfile
        visible={showEditModal}
        uid={auth.currentUser?.uid ?? null}
        currentName={userProfile?.fullName ?? ""}
        currentPhotoUri={userProfile?.photoUri ?? null}
        focusCep={focusCep}
        onClose={() => {
          setShowEditModal(false);
          setFocusCep(false);
        }}
        onSaved={(updates) =>
          setUserProfile((prev: any) => ({ ...prev, ...updates }))
        }
      />

      <DeleteAccount visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} />

      <ChangePassword
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}