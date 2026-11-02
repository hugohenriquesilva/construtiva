import type { ComponentType, ReactElement, ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import {Text, StyleSheet} from "react-native"

type MaskedViewProps = {
  maskElement: ReactElement;
  children?: ReactNode;
};

// Adapta a declaração legada do pacote ao tipo de componente React atual.
const TypedMaskedView = MaskedView as unknown as ComponentType<MaskedViewProps>;

export default function TextLogo(){
    return(
    <TypedMaskedView
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
    </TypedMaskedView>
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