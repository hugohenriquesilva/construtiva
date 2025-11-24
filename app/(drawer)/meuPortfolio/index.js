import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";


export default function meuPortfolio() {
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [clt, setClt] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [azul, setAzul] = useState(false);
  const corFundo = azul ? "#c4d4e2ff" : "#FFF";
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  function workClt() {
    setClt(!clt);
    setAzul(!clt);
  }

  /* Função para carregar informações não editáveis no formulário */
  useEffect(() => {
    async function carregarPortfolio() {
      try {
        const listaAtual = await AsyncStorage.getItem("@listaPortfolio");
        if (listaAtual) {
          const lista = JSON.parse(listaAtual);
          const ultimo = lista[lista.length - 1];

          setNome(ultimo.nome);
          setArea(ultimo.area);
          setCidade(ultimo.cidade);
          setBairro(ultimo.bairro);
          setDisponibilidade(ultimo.disponibilidade);
          setDescricao(ultimo.descricao);
          setClt(ultimo.clt);
          setAzul(ultimo.clt);

          setIsEditing(false); // 👈 desabilita a edição ao abrir
        }
      } catch (error) {
        console.error(error);
      }
    }

    carregarPortfolio();
  }, []);

  async function publicar() {
    if (!nome || !area || !cidade || !bairro || !disponibilidade || !descricao) {
      alert("Preencha todos os campos antes de publicar!");
      return;
    }

    const novoCard = {
      nome,
      area,
      cidade,
      bairro,
      disponibilidade,
      descricao,
      clt,
    };

    try {
      const listaAtual = await AsyncStorage.getItem("@listaPortfolio");
      let lista = listaAtual ? JSON.parse(listaAtual) : [];

      if (lista.length > 0) {
        // 🔁 Atualiza o último portfólio existente
        lista[lista.length - 1] = novoCard;
      } else {
        // 🆕 Se não existir, cria um novo
        lista.push(novoCard);
      }

      await AsyncStorage.setItem("@listaPortfolio", JSON.stringify(lista));

      alert("Portfólio atualizado com sucesso!");

      // limpar campos após publicar
      setNome("");
      setArea("");
      setCidade("");
      setBairro("");
      setDisponibilidade("");
      setClt(false);
      setDescricao("");
      setAzul(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o portfólio.");
    }

    router.push("/");
  }



  /*Função Atualiar*/
  async function atualizar() {
    try {
      const listaAtual = await AsyncStorage.getItem("@listaPortfolio");
      if (!listaAtual) {
        alert("Nenhum portfólio encontrado para atualizar.");
        return;
      }

      const lista = JSON.parse(listaAtual);

      const ultimoPortfolio = lista[lista.length - 1];

      setNome(ultimoPortfolio.nome);
      setArea(ultimoPortfolio.area);
      setCidade(ultimoPortfolio.cidade);
      setBairro(ultimoPortfolio.bairro);
      setDisponibilidade(ultimoPortfolio.disponibilidade);
      setDescricao(ultimoPortfolio.descricao);
      setClt(ultimoPortfolio.clt);
      setAzul(ultimoPortfolio.clt);

      setIsEditing(true);

      alert("Agora você pode atualizar os seus dados!");
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar o portfólio.");
    }
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <ScrollView
        style={[styles.container, clt && { backgroundColor: corFundo }]}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.title}></Text>

        {/* Nome do Profissional */}
        <Text style={styles.label}>Nome do profissional:</Text>
        <View style={styles.inputText}>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            editable={isEditing}
          />
        </View>


        {/* Área de atuação */}
        <Text style={styles.label}>Área de atuação:</Text>
        <View style={styles.inputSelect} >
          <Picker
            selectedValue={area}
            onValueChange={(v) => setArea(v)}
            style={styles.picker}
            enabled={isEditing}
          >
            <Picker.Item label="Selecione sua área profissional" value="" />
            <Picker.Item label="Pedreiro" value="Pedreiro" />
            <Picker.Item label="Pintor" value="Pintor" />
            <Picker.Item label="Gesseiro" value="Gesseiro" />
            <Picker.Item label="Azulejista" value="Azulejista" />
          </Picker>
        </View>

        {/* Cidade */}
        <Text style={styles.label}>Cidade:</Text>
        <View style={styles.inputText}>
          <TextInput
            value={cidade}
            onChangeText={setCidade}
            placeholder="Digite sua cidade"
            editable={isEditing}
          />
        </View>

        {/* Bairro */}
        <Text style={styles.label}>Bairro:</Text>
        <View style={styles.inputText}>
          <TextInput
            value={bairro}
            onChangeText={setBairro}
            placeholder="Digite seu bairro"
            editable={isEditing}
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
            enabled={isEditing}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="Próximos 3 dias" value="Em 3 dias" />
            <Picker.Item label="Em uma semana" value="Próxima semana" />
            <Picker.Item label="Daqui um mês" value="Em 1 mês" />
            <Picker.Item label="Três meses ou mais" value="Daqui 3 meses" />
          </Picker>
        </View>

        <View
          style={[
            styles.switchContainer,
            !isEditing && { opacity: 0.5 }
          ]}
          pointerEvents={isEditing ? "auto" : "none"}
        >
          <Switch value={clt} onValueChange={workClt} enabled={isEditing} />
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
          editable={isEditing}
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
    </KeyboardAvoidingView>
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
