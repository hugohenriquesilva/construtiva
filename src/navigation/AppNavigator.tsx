import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {LoginScreen} from "../screens/LoginScreen/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen/SignUpScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../types/navigation";




const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <SafeAreaView style={{ flex: 2}}>
      <NavigationContainer>
        
        {/*screenOptions={{ headerShown: false }} É para retirar a faixa branca da parte de cima da tela e o texto*/}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
      

                <Stack.Screen name="Login" component={LoginScreen} /> 

        <Stack.Screen name="Cadastro" component={SignUpScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
