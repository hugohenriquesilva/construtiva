import { auth, db } from "@/firebaseConfig";
import { logoutUser } from "@/src/services/authService";
import { cpfMask } from "@/src/utils/CpfMask";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
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
import ChangePassword from "../../components/ChangePassword/ChangePassword";
import EditProfile from "../../components/EditProfile/EditProfile";
import { menuItems } from "./OtherInformationScreen.mock";
import { styles } from "./OtherInformationScreen.styles";

function showMockAction(title: string) {
  Alert.alert(
    title,
    "Esta ação será conectada à funcionalidade correspondente em breve.",
  );
}

export default function OtherInformationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "MaisInformacoes">>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
            // Carregar dados do perfil
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              console.log("[OtherInformationScreen] users/{uid} carregado:", { photoUri: data.photoUri });
              setUserProfile(data);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        } finally {
          setLoading(false);
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
    } else if (tab === "menu") {
      // já está na tela de menu, não faz nada
    }
  };

  async function handleSignOut() {
    try {
      await logoutUser();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
    } catch (error) {
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
                    onError={(e) =>
                      console.log(
                        "[OtherInformationScreen] falha ao carregar avatar:",
                        userProfile.photoUri,
                        e.nativeEvent.error,
                      )
                    }
                    onLoad={() =>
                      console.log(
                        "[OtherInformationScreen] avatar carregado com sucesso:",
                        userProfile.photoUri,
                      )
                    }
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

          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuButton}
                onPress={() => {
                  if (item.label === "Minha senha") {
                    setShowPasswordModal(true);
                  } else {
                    showMockAction(item.action);
                  }
                }}
              >
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.status ? (
                  <Text
                    style={[
                      styles.badge,
                      item.status === "Ativo"
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    {item.status}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
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

      <ChangePassword
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}
