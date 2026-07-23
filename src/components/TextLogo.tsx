import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import {Text, StyleSheet} from "react-native"

export default function TextLogo(){
    return(
    <MaskedView
      maskElement={
        <Text style={LoginStyles.title}>
          Construtiva
        </Text>
      }
    >
      <LinearGradient
        colors={["#3f59cb", "#ab5d37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[LoginStyles.title, { opacity: 0 }]}>
          Construtiva
        </Text>
      </LinearGradient>
    </MaskedView>
    )
}

export const LoginStyles = StyleSheet.create({
     title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    color: "#555",
     }
  });