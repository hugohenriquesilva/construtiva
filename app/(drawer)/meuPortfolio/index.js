import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function meuPortfolio() {
  const [area, setArea] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [clt, setClt] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [azul, setAzul] = useState(false);
  const corFundo = azul ? "#c4d4e2ff" : "#FFF";

  async function carregarDados() {
    const dadosSalvos = await AsyncStorage.getItem("@meuPortfolio");

    if (dadosSalvos) {
      const obj = JSON.parse(dadosSalvos);
      setArea(obj.area);
      setCidade(obj.cidade);
      setBairro(obj.bairro);
      setDisponibilidade(obj.disponibilidade);
      setClt(obj.clt);
      setDescricao(obj.descricao);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function workClt() {
    setClt(!clt);
    setAzul(!clt);
  }


  async function publicar() {
  if (!area || !cidade || !bairro || !disponibilidade || !descricao) {
    alert("Preencha todos os campos antes de publicar!");
    return;
  }

  const dadosPortfolio = {
    area,
    cidade,
    bairro,
    disponibilidade,
    clt,
    descricao,
  };

    try {
      await AsyncStorage.setItem(
        "@meuPortfolio",
        JSON.stringify(dadosPortfolio)
      );

      alert("Portfólio salvo com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o portfólio.");
    }
  }


  return (
    <ScrollView
      style={[styles.container, clt && { backgroundColor: corFundo}]}
    >
      <Text style={styles.title}></Text>

      {/* Área de atuação */}
      <Text style={styles.label}>Selecionar área de atuação:</Text>
      <View style={styles.inputSelect}>
        <Picker
          selectedValue={area} 
          onValueChange={(v) => setArea(v)} 
          style={styles.picker}
        >
          <Picker.Item label="Selecione" value="" />
          <Picker.Item label="Pedreiro" value="Pedreiro" />
          <Picker.Item label="Pintor" value="Pintor" />
          <Picker.Item label="Gesseiro" value="Gesseiro" />
          <Picker.Item label="Azulejista" value="Azulejista" />
        </Picker>
      </View>

      {/* Cidade */}
      <Text style={styles.label}>Selecionar minha cidade:</Text>
      <View style={styles.inputText}>
        <TextInput
          value={cidade}
          onChangeText={setCidade}
          placeholder="Digite sua cidade"
        />
      </View>

      {/* Bairro */}
      <Text style={styles.label}>Bairro:</Text>
      <View style={styles.inputText}>
        <TextInput
          value={bairro}
          onChangeText={setBairro}
          placeholder="Digite seu bairro"
        />
      </View>

      {/* Disponibilidade */}
      <Text style={styles.label}>Disponibilidade:</Text>
      <View style={styles.inputSelect}>
        <Picker
          selectedValue={disponibilidade}
          onValueChange={(v) => setDisponibilidade(v)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Selecione" value="" />
          <Picker.Item label="Próximos 3 dias" value="Em 3 dias" />
          <Picker.Item label="Em uma semana" value="Próxima semana" />
          <Picker.Item label="Daqui um mês" value="Em 1 mês" />
          <Picker.Item label="Três meses ou mais" value="Daqui 3 meses" />
        </Picker>
      </View>

      <View style={styles.switchContainer}>
        <Switch value={clt} onValueChange={workClt} />
        <Text style={styles.switchText}>
          Disponível para trabalhar como CLT
        </Text>
      </View>

      {/* Descrição */}
      <Text style={styles.label}>Descrição do seu trabalho:</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={6}
        placeholder={
        `Descreva brevemente seu trabalho. Dica:
        + Coloque os anos de experiência
        + Coloque serviços relevantes
        + Coloque os serviços que consegue fazer`}
        value={descricao}
        onChangeText={setDescricao}
      />

      <TouchableOpacity onPress={publicar}>
        <LinearGradient
          colors={["#5B69A3", "#D26E38"]} // esquerda → direita
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.botaoPublicar}
        >
          <Text style={styles.botaoTexto}>Publicar</Text>
        </LinearGradient>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#FFF",
    marginTop: -35,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 10,
    color: "#4b4b4b",
    alignSelf: "center",
    fontFamily: "Jua",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  inputSelect: {
    backgroundColor: "#e6e6e6",
    borderRadius: 25,
    paddingHorizontal: 14,
    marginTop: 5,
    marginBottom: 5,
  },
  inputText: {
    backgroundColor: "#e6e6e6",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 5,
  },
  picker: {
    height: 50,
    color: "#333",
    fontSize: 15,
  },

  pickerItem: {
    fontSize: 18,
    color: "#555",
  },

  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    marginLeft: 8,
    fontSize: 14,
  },
  textArea: {
    backgroundColor: "#e6e6e6",
    borderRadius: 12,
    padding: 14,
    height: 150,
    marginTop: 15,
    textAlignVertical: "top",
  },
  botaoPublicar: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 55,
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Jua",
  },
});
