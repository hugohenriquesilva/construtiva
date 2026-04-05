import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import LoginScreen from "../screens/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen/SignUpScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
          <Stack.Screen name="Cadastro" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
