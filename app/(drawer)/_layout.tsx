import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import { CustomDrawerContent } from "../_layoutDrawer";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Jua: require("../../assets/fonts/Jua-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#FFFFE8",
          elevation: 0,
          shadowOpacity: 0,
        },
        
        headerTitleStyle: {
          fontFamily: "Jua",
          fontSize: 22,
          color: "#5B69A3",
        },
      }}
    >
      <Drawer.Screen
        name="home/index"
        options={{ title: "Procurar Profissionais" }}
      />

      <Drawer.Screen
        name="meuPortfolio/index"
        options={{ title: "Meu Portfólio" }}
      />
    </Drawer>
  );
}