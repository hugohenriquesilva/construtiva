import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BuscaPortfolioScreen from './src/screens/BuscaPortfolio/BuscaPortfolioScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="BuscaPortfolio" component={BuscaPortfolioScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
