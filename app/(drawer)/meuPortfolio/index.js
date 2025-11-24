import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";

import {
  Alert,
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
const [menuAberto, setMenuAberto] = useState(false);
const [temPortfolio, setTemPortfolio] = useState(false);


useEffect(() => {
  async function carregarLista() {
    try {
      const listaAtual = await AsyncStorage.getItem("@listaPortfolio");
      if (listaAtual) {
        const lista = JSON.parse(listaAtual);
        if (Array.isArray(lista) && lista.length > 0) {
          setTemPortfolio(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  carregarLista();
}, []);

  function workClt() {
    setClt(!clt);
    setAzul(!clt);
  }


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

      lista.push(novoCard);

      await AsyncStorage.setItem("@listaPortfolio", JSON.stringify(lista));
setTemPortfolio(true);
      alert("Portfólio publicado com sucesso!");
    
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o portfólio.");
    }
  }
  async function excluir() {
  try {
    const listaAtual = await AsyncStorage.getItem("@listaPortfolio");

    if (!listaAtual) {
      alert("Não há portfólios para excluir.");
      return;
    }

    const lista = JSON.parse(listaAtual);

    if (!Array.isArray(lista) || lista.length === 0) {
      alert("Não há portfólios para excluir.");
      return;
    }

    // por enquanto vamos excluir o ÚLTIMO portfólio da lista
    lista.pop();

    await AsyncStorage.setItem("@listaPortfolio", JSON.stringify(lista));

    // se a lista ficou vazia, desabilita o botão de +
    if (lista.length === 0) {
      setTemPortfolio(false);   // usa o estado que já criamos antes
    }

    // fecha o menu
    setMenuAberto(false);

    // limpa os campos da tela
    setNome("");
    setArea("");
    setCidade("");
    setBairro("");
    setDisponibilidade("");
    setClt(false);
    setDescricao("");
    setAzul(false);

    alert("Portfólio excluído com sucesso!");
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir o portfólio.");
  }
}

function confirmarExclusao() {
  Alert.alert(
    "Confirmar exclusão",
    "Tem certeza que deseja excluir o seu portfólio?",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: excluir },
    ]
  );
}

function opcoes() {
  if (!temPortfolio) return;           // não faz nada se ainda não publicou
  setMenuAberto((prev) => !prev);
}

  return (
    <KeyboardAvoidingView
      style={{ flex: 1,backgroundColor: corFundo }}
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
          />
        </View>


        {/* Área de atuação */}
        <Text style={styles.label}>Área de atuação:</Text>
        <View style={styles.inputSelect}>
          <Picker
            selectedValue={area}
            onValueChange={(v) => setArea(v)}
            style={styles.picker}
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
      
      </ScrollView>
{menuAberto && (
  <TouchableOpacity
    style={styles.overlay}
    activeOpacity={1}
    onPress={() => setMenuAberto(false)} // fecha ao tocar fora
  />
)}
        {menuAberto && (
  <View style={styles.containerAcoes}>
    {/* Botão Atualizar */}
    <TouchableOpacity style={styles.botaoAcao}>
      <LinearGradient
        colors={["#5B69A3", "#D26E38"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.degradeAcao}
      >
        <FontAwesome5
          name="sync-alt"
          size={14}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.textoAcao}>Atualizar</Text>
      </LinearGradient>
    </TouchableOpacity>

    {/* Botão Excluir */}
    <TouchableOpacity style={styles.botaoAcao} onPress={confirmarExclusao}>
  <LinearGradient
    colors={["#5B69A3", "#D26E38"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.degradeAcao}
  >
    <FontAwesome5
      name="trash-alt"
      size={14}
      color="#fff"
      style={{ marginRight: 8 }}
    />
    <Text style={styles.textoAcao}>Excluir</Text>
  </LinearGradient>
</TouchableOpacity>
  </View>
)}

<View style={[styles.linhaBotoes, menuAberto && { opacity: 0.4 }]}>
        <TouchableOpacity onPress={publicar}>
          <LinearGradient
            colors={["#5B69A3", "#D26E38"]} // esquerda → direita
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.botaoPublicar}
          >
            <FontAwesome5
    name="bullhorn"    
    size={16}
    color="#fff"
    style={{ marginRight: 8 }}
  />
            <Text style={styles.botaoTexto}>Publicar</Text>
          </LinearGradient>
        </TouchableOpacity>
      <TouchableOpacity
  onPress={opcoes}
  disabled={!temPortfolio} 
  style={[
    styles.botaoMais,
    menuAberto && { opacity: 0.4 },      // efeito quando menu aberto
    !temPortfolio && styles.botaoMaisDesabilitado, // aparência de desabilitado
  ]}
>
  <LinearGradient
    colors={["#5B69A3", "#D26E38"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.degradeMais}
  >
   <FontAwesome5 name="plus" size={38} color="#fff" />
  </LinearGradient>
</TouchableOpacity>
</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  linhaBotoes: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 25,
   marginBottom: 32,
  paddingHorizontal: 18, 
},
  botaoPublicar: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 65,
    borderRadius: 30,
    alignItems: "center",
   justifyContent: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Jua",
    alignItems: "left",
  },
  
  botaoMais: {
  width: 55,
  height: 55,
  borderRadius: 32,
  overflow: "hidden",
  
},

botaoMaisDesabilitado: {
  opacity: 0.4,
},

degradeMais: {
  width: "100%",
  height: "100%",
   borderRadius: 32,
  justifyContent: "center",
  alignItems: "center",
},
containerAcoes: {
  marginTop: 20,
  width: "100%",
  alignItems: "flex-end",  
},

botaoAcao: {
  marginBottom: 8,         // espaço entre Atualizar e Excluir
  borderRadius: 30,
  overflow: "hidden",
},

degradeAcao: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 30,
},

textoAcao: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},
overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255,255,255,0.7)", // embaçado
},


});
