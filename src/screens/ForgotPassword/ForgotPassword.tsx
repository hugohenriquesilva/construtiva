import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
// Text ainda é usado em title, subtitle, erro, etc.
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "@/src/services/authService";
import { styles } from "./ForgotPassword.styles";
import { Button } from "@/src/components/TouchableOpacityButton";
import TextLogo from "@/src/components/TextLogo";

const logo = require("@/assets/images/logoConstrutiva.png");

export function ForgotPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  async function handleResetPassword() {
    if (!email) {
      setErro("Digite seu email para continuar.");
      return;
    }

    setErro(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSucesso(true);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setErro("Nenhuma conta encontrada com esse email.");
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido.");
      } else {
        setErro("Erro ao enviar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* LOGO */}
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <TextLogo />
      </View>

      {!sucesso ? (
        <>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            Digite o email cadastrado e enviaremos um link para redefinir sua
            senha.
          </Text>

          {/* INPUT EMAIL */}
          <View
            style={[
              styles.inputContainer,
              { borderColor: isFocused ? "#6B5CE7" : "#ccc" },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={isFocused ? "#6B5CE7" : "#999"}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErro(null);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {erro && <Text style={styles.erro}>{erro}</Text>}

          <Button
            title="Enviar link"
            onPress={handleResetPassword}
            loading={isLoading}
            loadingTitle="Enviando..."
          />
        </>
      ) : (
        /* TELA DE SUCESSO */
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#6B5CE7" />
          <Text style={styles.successTitle}>Email enviado!</Text>
          <Text style={styles.successSubtitle}>
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </Text>
        </View>
      )}

      {/* VOLTAR PARA LOGIN */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={16} color="#6B5CE7" />
        <Text style={styles.backText}> Voltar para o Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
