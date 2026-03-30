import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Tela de Login</Text>
      <TouchableOpacity onPress={() => router.push("/SignUp")}>
        <Text>Ir para cadastro</Text>
      </TouchableOpacity>
    </View>
  );
}
