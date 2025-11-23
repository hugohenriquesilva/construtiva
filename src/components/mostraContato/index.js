import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ModalMostraContato({ handleClose }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Contato:</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>email do profissional</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tel:</Text>
            <Text style={styles.value}>telefone do profissional</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  header: {
    backgroundColor: "#faf7d8",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  content: {
    padding: 20,
    gap: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },

  value: {
    fontSize: 16,
    color: "#333",
  },

  closeButton: {
    backgroundColor: "#d48a50",
    paddingVertical: 12,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
