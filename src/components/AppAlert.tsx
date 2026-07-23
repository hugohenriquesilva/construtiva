import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  Image,
  ImageBackground,
} from "react-native";
import { Button } from "./TouchableOpacityButton";

interface AppAlertProps {
  visible: boolean;
  character: ImageSourcePropType | null;
  title: string;
  subTitle: string | null;
  messages?: string[] | null;
  buttonLabel?: string;
  onClose: () => void;
}
export function AppAlert({
  visible,
  character,
  title,
  subTitle,
  messages = [],
  buttonLabel = "OK",
  onClose,
}: AppAlertProps) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ImageBackground
            source={require("@/assets/images/background.png")}
            style={styles.background}
            blurRadius={0.5}
          >
            {character && (
              <Image
                source={character}
                style={styles.character}
                resizeMode="contain"
              />
            )}
          </ImageBackground>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {messages != null && (
              <>
                <Text style={styles.subtitle}>{subTitle}</Text>
                {messages.map((msg, index) => (
                  <Text key={index} style={styles.message}>
                    • {msg}
                  </Text>
                ))}
              </>
            )}
            <View style={styles.divider} />
            <Button title="OK" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
  },

  //   characterAndBackground: {
  //     flexDirection: "row", // Garante que fiquem no mesmo contexto
  //     alignItems: "flex-end", // Alinha os itens pela base (fundo)
  //     justifyContent: "center", // Centraliza horizontalmente (opcional)
  //     position: "relative",
  //     height: 300, // Defina a altura desejada para o container
  //     width: "100%",
  //     overflow: "hidden",
  //   },

  background: {
    flexDirection: "row", // Garante que fiquem no mesmo contexto
    alignItems: "flex-end", // Alinha os itens pela base (fundo)
    justifyContent: "center", // Centraliza horizontalmente (opcional)
    position: "relative",
    height: 250, // Defina a altura desejada para o container
    width: "100%",
    overflow: "hidden",
  },

  character: {
    width: 240, // Ajuste conforme necessário
    height: 209, // Ajuste conforme necessário
    zIndex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3f59cb",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
});
