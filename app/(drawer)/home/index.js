import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ModalMostraContato } from "../../../src/components/mostraContato/index";

export default function Home() {
  const [modalVisible, setModalVisible] = React.useState(false);

  function Conversar() {
    setModalVisible(true); //abri um modal que foi importado previamente
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Procurar profissionais</Text>

      <View style={styles.filterBox}>
        <Text style={styles.filterText}>
          Filtre de acordo com a sua necessidade
        </Text>

        <View style={styles.selectRow}>
          <View style={styles.select}>
            <Text style={styles.selectLabel}>Profissional ▼</Text>
          </View>
          <View style={styles.select}>
            <Text style={styles.selectLabel}>Localização ▼</Text>
          </View>
        </View>
      </View>

      class 

      {/* Card 1 */}
      <View style={styles.card}>
        <Text style={styles.cardName}>José Antônio Barbosa</Text>
        <Text style={styles.cardRole}>Pedreiro</Text>

        <Text style={styles.sectionLabel}>Descrição:</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            Sou pedreiro com 15 anos de experiência. Já participei da construção
            do shopping Iguatemi, de várias lojas. Sei fazer da fundação ao
            acabamento.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Local:</Text>
          <Text style={styles.infoValue}>Jardim Astro</Text>
          <Text style={styles.infoValue}>Sorocaba</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilidade:</Text>
          <Text style={styles.infoValue}>Início imediato</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={Conversar}>
          <Text style={styles.buttonText}>Conversar</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide">
          <ModalMostraContato handleClose={() => setModalVisible(false)} />
        </Modal>
      </View>

      {/* Card 2 */}
      <View style={styles.card}>
        <Text style={styles.cardName}>Paulo Cesar Meneguel</Text>
        <Text style={styles.cardRole}>Pintor</Text>

        <Text style={styles.sectionLabel}>Descrição:</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            Meu nome é Paulo, faço pintura, massa corrida, pintura de portão,
            portas, envernizamento e muito mais. Tenho 10 anos de experiência e
            transporte próprio.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Local:</Text>
          <Text style={styles.infoValue}>Vitoria Régia III</Text>
          <Text style={styles.infoValue}>Sorocaba</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilidade:</Text>
          <Text style={styles.infoValue}>Mediante agendamento</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Conversar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf8e8", padding: 10 },

  header: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 10,
    color: "#4b4b4b",
    alignSelf: "center",
  },

  filterBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterText: { fontSize: 14, marginBottom: 10, color: "#555" },

  selectRow: { flexDirection: "row", gap: 10 },

  select: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  selectLabel: { fontSize: 14, color: "#444" },

  card: {
    backgroundColor: "#e8e8e8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardName: { fontSize: 20, fontWeight: "600", textAlign: "center" },
  cardRole: { fontSize: 16, textAlign: "center", marginBottom: 10 },

  sectionLabel: {
    fontWeight: "600",
    color: "#4b4b4b",
    marginBottom: 5,
    marginTop: 5,
  },

  descriptionBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowOpacity: 0.05,
  },
  descriptionText: { fontSize: 14, color: "#444" },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  infoLabel: { fontWeight: "600", marginRight: 5 },
  infoValue: { marginRight: 10, color: "#333" },

  button: {
    marginTop: 10,
    backgroundColor: "#d48a50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
