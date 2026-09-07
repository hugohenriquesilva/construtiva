import { StyleSheet } from "react-native";

const CENTER_BUTTON_SIZE = 48; // smaller than the bar's own height, so it stays within its bounds
const CENTER_BUTTON_RADIUS = CENTER_BUTTON_SIZE / 2; // fully round

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#DCE2F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabButton: {
    paddingHorizontal: 8,
  },
  centerSlot: {
    width: CENTER_BUTTON_SIZE,
    alignItems: "center",
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_RADIUS,
    backgroundColor: "#3B7DF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B7DF6",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
