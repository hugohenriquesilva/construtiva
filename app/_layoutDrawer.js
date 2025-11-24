import MaskedView from "@react-native-masked-view/masked-view";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

export function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          padding: 20,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

      

        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: 26,
                fontFamily: "Jua",
                color: "black",
              }}
            >
              Construtiva
            </Text>
          }
        >
          <LinearGradient
            colors={["#5B69A3", "#D26E38"]} // esquerda → direita
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={{
                fontSize: 26,
                fontFamily: "Jua",
                opacity: 0, // o texto real é mostrado apenas pelo mask
              }}
            >
              Construtiva
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;