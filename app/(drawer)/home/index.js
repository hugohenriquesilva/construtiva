import AsyncStorage from "@react-native-async-storage/async-storage";
import {ModalMostraContato} from "../../../src/components/mostraContato";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from "react-native";

export default function Home() {
  const [filtrosProfissional, setFiltrosProfissional] = useState([]);
  const [filtrosLocalizacao, setFiltrosLocalizacao] = useState([]);
  const [contatoSelecionado, setContatoSelecionado] = useState({email: "", telefone: ""});
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState("");

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [cards, setCards] = useState([]);

  useEffect(() => {
  async function carregarCards() {
    const dados = await AsyncStorage.getItem("@listaPortfolio");

    if (dados) {
      const lista = JSON.parse(dados);
      setCards(lista);

      const profs = [...new Set(lista.map(item => item.area))];
      const locs = [...new Set(lista.map(item => item.cidade))];

      setFiltrosProfissional(profs);
      setFiltrosLocalizacao(locs);

    } else {
      setCards([]); //caso ainda não exista nada salvo
    }
  }

  //Carregar ao abrir o app
  carregarCards();

  //Atualizar sempre que voltar para a tela
  const unsubscribe = navigation.addListener("focus", carregarCards);
  return unsubscribe;
}, [navigation]);

  function Conversar(email, telefone) {
      setContatoSelecionado({email, telefone});
      setModalVisible(true);
    //abri um modal que foi importado previamente
  }

  function fecharModal() {
    setModalVisible(false);
  }

    const cardsFiltrados = cards.filter((item) => {
    return (
      (profissionalSelecionado === "" ||
        item.area === profissionalSelecionado) &&
      (localizacaoSelecionada === "" ||
        item.cidade === localizacaoSelecionada)
    );
  });

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                <Text style={styles.header}></Text>

                <View style={styles.filterBox}>
                    <Text style={styles.filterText}>Filtre de acordo com a sua necessidade</Text>

                    <View style={styles.selectRow}>

                        <View style={styles.select}>
                            <Picker
                                selectedValue={profissionalSelecionado}
                                onValueChange={(value) => setProfissionalSelecionado(value)}
                                style={{ width: "100%" }}
                            >
                                <Picker.Item label="Profissional ▼" value="" />

                                {filtrosProfissional.map((prof, index) => (
                                    <Picker.Item key={index} label={prof} value={prof} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.select}>
                            <Picker
                                selectedValue={localizacaoSelecionada}
                                onValueChange={(value) => setLocalizacaoSelecionada(value)}
                                style={{ width: "100%" }}
                            >
                                <Picker.Item label="Localização ▼" value="" />

                                {filtrosLocalizacao.map((loc, index) => (
                                    <Picker.Item key={index} label={loc} value={loc} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                {cardsFiltrados.map((item, index) => (
                    <View key={index} style={styles.card}>

                        <Text style={styles.cardName}>{item.nome}</Text>

                        {item.clt && (
                            <View style={styles.badgeCLT}>
                                <Text style={styles.badgeText}>CLT</Text>
                            </View>
                        )}

                        <Text style={styles.cardProfissional}>Profissional</Text>

                        <Text style={styles.cardRole}>{item.area}</Text>

                        <Text style={styles.sectionLabel}>Descrição:</Text>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{item.descricao}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Local:</Text>

                            <View style={styles.infoValueBox}>
                                <Text style={styles.infoValue}>{item.bairro}</Text>
                            </View>

                            <View style={styles.infoValueBox}>
                                <Text style={styles.infoValue}>{item.cidade}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Disponibilidade:</Text>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoValue}>{item.disponibilidade}</Text>
                            </View>
                        </View>

                        {item.clt && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Contratação:</Text>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoValue}>Disponível para CLT</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => Conversar(item.email, item.telefone)}
                        >
                            <Text style={styles.buttonText}>Conversar</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={fecharModal}
            >
                <ModalMostraContato
                    handleClose={fecharModal}
                    email={contatoSelecionado.email}
                    telefone={contatoSelecionado.telefone}
                />
            </Modal>
        </>
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
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
  },

  selectLabel: { fontSize: 10, color: "#444" },

  card: {
    backgroundColor: "#e8e8e8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardName: { fontSize: 20, fontWeight: "600", textAlign: "center", fontFamily: "Jua", marginBottom: 7},
  cardProfissional: { fontSize: 18, fontWeight: "600", textAlign: "center", fontFamily: "Jua" },
  cardRole: { fontSize: 17, textAlign: "center", marginBottom: 10, fontFamily: "Jua" },

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

  badgeCLT: {
    alignSelf: "center",
    backgroundColor: "#5B69A3", // azul bonito
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },

  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Jua",
  },

});
