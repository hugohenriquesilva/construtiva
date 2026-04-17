import { LinearGradient } from "expo-linear-gradient";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
}

export function Button({
  title,
  onPress,
  loading = false,
  loadingTitle = "Carregando...",
}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      <LinearGradient
        colors={["#3f59cb", "#ab5d37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.text}>{loadingTitle}</Text>
          </>
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
