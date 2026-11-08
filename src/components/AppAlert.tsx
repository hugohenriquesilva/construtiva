import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  Image,
  StyleProp,
  TextStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "./TouchableOpacityButton";

interface AppAlertProps {
  visible: boolean;
  character: ImageSourcePropType | null;
  title: string;
  subTitle: string | null;
  messages?: string[] | null;
  buttonLabel?: string;
  buttonTextStyle?: StyleProp<TextStyle>;
  buttonLoading?: boolean;
  buttonLoadingLabel?: string;
  onClose: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
  onDismiss?: () => void;
}
export function AppAlert({
  visible,
  character,
  title,
  subTitle,
  messages = [],
  buttonLabel = "OK",
  buttonTextStyle,
  buttonLoading,
  buttonLoadingLabel,
  onClose,
  secondaryButtonLabel,
  onSecondaryPress,
  onDismiss,
}: AppAlertProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.background}>
            {/* Fundo: Image posicionada atrás do personagem (ImageBackground está obsoleto) */}
            <Image
              source={require("@/assets/images/background.png")}
              style={StyleSheet.absoluteFill}
              blurRadius={0.5}
            />
            {character && (
              <Image
                source={character}
                style={styles.character}
                resizeMode="contain"
              />
            )}
            {onDismiss && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            )}
          </View>

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
            <Button
              title={buttonLabel}
              onPress={onClose}
              textStyle={buttonTextStyle}
              loading={buttonLoading}
              loadingTitle={buttonLoadingLabel}
            />
            {secondaryButtonLabel && onSecondaryPress && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onSecondaryPress}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryButtonLabel}
                </Text>
              </TouchableOpacity>
            )}
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
  secondaryButton: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: "#B3261E",
    fontSize: 15,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});