import { View, Text, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { homeStyles } from "./HomeScreen.styles";

export function HomeScreen() {
    async function handleLogout() {
        try {
            await signOut(auth);
        } catch (error) {
            alert("Erro ao deslogar");
        }
    }

    return (
        <View style={homeStyles.container}>
            <Text style={homeStyles.text}>home page teste</Text>
            <TouchableOpacity style={homeStyles.button} onPress={handleLogout}>
                <Text style={homeStyles.buttonText}>Deslogar</Text>
            </TouchableOpacity>
        </View>
    );
}