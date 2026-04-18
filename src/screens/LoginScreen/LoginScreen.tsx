import { InputPattern } from "@/src/components/InputPattern";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Button } from "../../components/TouchableOpacityButton";
import { LoginStyles } from "../LoginScreen/LoginScreen.Styles";
import { Image, Text, StyleSheet, TouchableOpacity, View } from "react-native";
import iconEmail from "../../../assets/images/IconEmail.png";
import iconSenha from "../../../assets/images/IconSenha.png";
import logo from "@/assets/images/logoConstrutiva.png";
import EyeOpen from "../../../assets/images/EyeOpen.png";
import EyeClose from "../../../assets/images/EyeClose.png";
import TextLogo from "@/src/components/TextLogo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";
import IconGoogle from "@/assets/images/IconGoogle.png";
import IconFacebook from "@/assets/images/IconFacebook.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { loginUser } from "@/src/services/authService";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();
  const [erro, setErro] = useState<string | null>(null);

  async function handleLogin(email: string, senha: string) {
    try {
      await loginUser(email, senha);
      alert(`logado`);
    } catch (error: any) {
      if (email === "" || senha === "") {
        setErro("Preencha todos os campos");
      } else if (error.code === "auth/wrong-password") {
        setErro("Senha incorreta.");
      } else if (error.message === "email-not-verified") {
        setErro("Email não verificado. Cheque sua caixa de entrada.");
      } else if (error.code === "auth/invalid-email") {
        setErro("E-mail inválido");
      } else if (error.code === "auth/user-not-found") {
        setErro("Cadastre-se na plataforma");
      } else {
        setErro("Erro ao fazer login. Tente novamente.");
      }
    }
  }
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      enableOnAndroid={true}
    >
      <View style={LoginStyles.container}>
        {/* LOGO */}

        <View style={LoginStyles.hero}>
          <Image source={logo} style={LoginStyles.logo} />
          <TextLogo />
        </View>

        <InputPattern
          name="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          icon={iconEmail}
        />

        <InputPattern
          name="senha"
          placeholder="*********"
          value={senha}
          onChange={setSenha}
          icon={iconSenha}
          secureTextEntry={true}
        />

        {/* ESQUECI SENHA */}
        <Text
          style={LoginStyles.forgot}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          Esqueci minha senha
        </Text>

        {erro && (
          <Text style={{ color: "red", textAlign: "center" }}>{erro}</Text>
        )}

        <Button title="Login" onPress={() => handleLogin(email, senha)} />

        <View style={LoginStyles.divider}>
          <View style={LoginStyles.line} />
          <Text style={LoginStyles.text}>OU</Text>
          <View style={LoginStyles.line} />
        </View>
        <View style={LoginStyles.containerIcons}>
          <Image source={IconGoogle} style={LoginStyles.iconStart} />
          <Image source={IconFacebook} style={LoginStyles.iconStart} />
        </View>
        {/* CADASTRO */}
        <View style={LoginStyles.ContainerRegister}>
          <Text style={LoginStyles.register}>
            Primeiro acesso?{" "}
            <Text
              style={LoginStyles.link}
              onPress={() => navigation.navigate("Cadastro")}
            >
              Cadastre-se aqui
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
