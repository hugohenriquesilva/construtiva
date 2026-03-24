import { StyleSheet, Text, View } from "react-native";
import "../firebaseConfig";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>olá, esta é a tela de login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
