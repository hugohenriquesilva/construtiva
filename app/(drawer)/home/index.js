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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.header}></Text>

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

          <View style={styles.infoValueBox}>
            <Text style={styles.infoValue}>Jardim Astro</Text>
          </View>

          <View style={styles.infoValueBox}>
            <Text style={styles.infoValue}>Sorocaba</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilidade:</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>Início imediato</Text>
          </View>

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
          
          <View style={styles.infoValueBox}>
            <Text style={styles.infoValue}>Jardim Vitória Régia</Text>
          </View>

          <View style={styles.infoValueBox}>
            <Text style={styles.infoValue}>Sorocaba</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilidade:</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>Mediante agendamento</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={Conversar}>
          <Text style={styles.buttonText}>Conversar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 10 },

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
    marginTop: -33,
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

  cardName: { fontSize: 20, fontWeight: "600", textAlign: "center", fontFamily: "Jua" },
  cardRole: { fontSize: 16, textAlign: "center", marginBottom: 10, fontFamily: "Jua" },

  sectionLabel: {
    fontWeight: "600",
    color: "#5b69a3",
    marginBottom: 5,
    marginTop: 5,
    fontFamily: "Jua",
    fontSize: 16,
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
  infoLabel: { fontWeight: "600", marginRight: 5, color: "#5B69A3",fontFamily: "Jua", fontSize: 16 },
  
  infoBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },

  infoValueBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoValue: {
    color: "#333",
    fontSize: 14,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#d48a50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "Jua"},
});
