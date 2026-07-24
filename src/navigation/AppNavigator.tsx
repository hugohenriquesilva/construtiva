import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";

import { LoginScreen } from "../screens/LoginScreen/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen/SignUpScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import ProfessionalFormScreen from "../screens/ProfessionalFormScreen/ProfessionalFormScreen";
import { RootStackParamList } from "../../types/navigation";
import { ForgotPassword } from "../screens/ForgotPassword/ForgotPassword";
import ProfilePortfolioScreen from '../screens/ProfilePortfolio/ProfilePortfolioScreen';
import OtherInformationScreen from '../screens/OtherInformationScreen/OtherInformationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

//atual agora

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="FormularioProfissional" component={ProfessionalFormScreen} />
            <Stack.Screen name="PortfolioProfissional" component={ProfilePortfolioScreen} />
            <Stack.Screen name="MaisInformacoes" component={OtherInformationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
