import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  mainScreen: {
    paddingBlockStart: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  title: {
    color: "black",
    fontSize: 30,
    textAlign: "center",
    padding: 10,
  },

  paragraph: {
    fontSize: 15,
    textAlign: "center",
    paddingBottom: 30,
  },

  error: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 8,
  },

  logoContainer: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 150,
    height: 150,
  },

  passwordRulesContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    backgroundColor: "#ffe3e3",
  },
  passwordRulesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  passwordRulesList: {
    gap: 6,
  },
  passwordRuleItem: {
    fontSize: 14,
    color: "#3A3A3A",
    lineHeight: 20,
  },
});
