import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={["#3f59cb", "#ab5d37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
