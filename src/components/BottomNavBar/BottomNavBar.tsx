import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabKey } from "../../../types/home";
import { styles } from "./BottomNavBar.styles";

interface BottomNavBarProps {
  activeTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
  /** Called when the raised center "+" button is pressed. */
  onAddPress?: () => void;
}

type TabConfig = { key: BottomTabKey; icon: keyof typeof Ionicons.glyphMap };

// Two tabs on the left of the center button, two on the right —
// this is what creates the notch for the floating "+" in the middle.
const LEFT_TABS: TabConfig[] = [
  { key: "home", icon: "home-outline" },
  { key: "professional", icon: "search-outline" },
];

const RIGHT_TABS: TabConfig[] = [
  { key: "services", icon: "construct-outline" },
  { key: "menu", icon: "menu-outline" },
];

const ACTIVE_COLOR = "rgba(91, 105, 163, 1)";
const INACTIVE_COLOR = "#9B9B9B";

export default function BottomNavBar({
  activeTab,
  onTabPress,
  onAddPress,
}: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (tab: TabConfig) => {
    const isActive = tab.key === activeTab;
    return (
      <TouchableOpacity
        key={tab.key}
        style={styles.tabButton}
        onPress={() => onTabPress(tab.key)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={tab.icon}
          size={24}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { marginBottom: 16 + insets.bottom }]}>
      {LEFT_TABS.map(renderTab)}

      <View style={styles.centerSlot} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.centerButton}
          onPress={onAddPress}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {RIGHT_TABS.map(renderTab)}
    </View>
  );
}
