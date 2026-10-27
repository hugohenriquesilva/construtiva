import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebaseConfig";
import { useProfessions } from "@/src/hooks/useProfessions";
import {
  createProfession,
  deleteProfession,
  normalizeProfessionName,
  Profession,
  updateProfession,
} from "@/src/services/professionService";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./ProfessionsAdminScreen.styles";

// Converte os erros do professionService em mensagens para o admin
function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "profession-empty") return "Informe o nome da profissão.";
  if (message === "profession-duplicate") return "Já existe uma profissão com esse nome.";
  if (message.startsWith("profession-in-use:")) {
    const count = message.split(":")[1];
    return `Não é possível excluir: usada por ${count} portfólio(s).`;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function ProfessionsAdminScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { professions, loading, error, reload } = useProfessions();
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Profession | null>(null);
  const [editName, setEditName] = useState("");

  // Proteção extra: a tela só abre para admin (a garantia real está nas regras do Firestore)
  useFocusEffect(
    useCallback(() => {
      const checkAdmin = async () => {
        const uid = auth.currentUser?.uid;
        const snap = uid ? await getDoc(doc(db, "users", uid)) : null;
        if (snap?.data()?.role !== "admin") {
          Alert.alert("Acesso negado", "Esta área é exclusiva para administradores.");
          navigation.goBack();
        }
      };

      checkAdmin();
    }, [navigation]),
  );

  async function runAction(action: () => Promise<void>): Promise<boolean> {
    setSaving(true);
    try {
      await action();
      reload();
      return true;
    } catch (e) {
      console.error("Erro na edição de profissões:", e);
      Alert.alert("Atenção", errorMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    const ok = await runAction(() => createProfession(newName));
    if (ok) setNewName("");
  }

  function openEdit(profession: Profession) {
    setEditing(profession);
    setEditName(profession.name);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const ok = await runAction(() => updateProfession(editing.id, editName));
    if (ok) setEditing(null);
  }

  function handleDelete(profession: Profession) {
    Alert.alert(
      "Excluir profissão",
      `Deseja excluir "${profession.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => runAction(() => deleteProfession(profession.id)),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#111111" />
          </Pressable>
          <Text style={styles.title}>Edição de profissões</Text>
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Nova profissão"
            placeholderTextColor="#9B9B9B"
            autoCapitalize="characters"
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
          />
          <Pressable
            style={[styles.addButton, (saving || !newName.trim()) && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={saving || !newName.trim()}
          >
            <Text style={styles.addButtonText}>Adicionar</Text>
          </Pressable>
        </View>
        {!!newName.trim() && (
          <Text style={styles.hint}>
            Será salva como: {normalizeProfessionName(newName)}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={professions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>
                {error
                  ? "Não foi possível carregar as profissões."
                  : "Nenhuma profissão cadastrada."}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Pressable
                  accessibilityLabel={`Editar ${item.name}`}
                  hitSlop={10}
                  onPress={() => openEdit(item)}
                  disabled={saving}
                >
                  <Feather name="edit-2" size={20} color="#5B69A3" />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Excluir ${item.name}`}
                  hitSlop={10}
                  onPress={() => handleDelete(item)}
                  disabled={saving}
                >
                  <Feather name="trash-2" size={20} color="#E10B0B" />
                </Pressable>
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={editing !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar profissão</Text>
            <Text style={styles.modalLabel}>Nome da profissão</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da profissão"
              placeholderTextColor="#9B9B9B"
              autoCapitalize="characters"
              autoFocus
              value={editName}
              onChangeText={setEditName}
              onSubmitEditing={handleSaveEdit}
            />
            {!!editName.trim() && (
              <Text style={styles.modalHint}>
                Será salva como: {normalizeProfessionName(editName)}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setEditing(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>
                  {saving ? "Salvando..." : "Salvar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
