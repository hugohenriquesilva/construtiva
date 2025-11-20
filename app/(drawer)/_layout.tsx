import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="meuPortfolio"
        options={{
          title: "Meu Portfólio",
        }}
      />
    </Drawer>
  );
}
