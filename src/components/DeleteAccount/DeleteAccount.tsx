import { useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { auth } from '@/firebaseConfig';
import { deleteCurrentAccount } from '@/src/services/accountService';
import { styles } from './DeleteAccount.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccount({ visible, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const busy = useRef(false);
  const needsPassword = auth.currentUser?.providerData.some((provider) => provider.providerId === 'password');

  async function handleDelete() {
    if (busy.current || (needsPassword && !password)) return;
    busy.current = true;
    setDeleting(true);
    try {
      await deleteCurrentAccount(password);
      // O AppNavigator observa a exclusão e volta para o login automaticamente.
      setPassword('');
      onClose();
    } catch (error) {
      const code = (error as { code?: string }).code;
      const message = code === 'auth/requires-recent-login' || code === 'functions/failed-precondition'
        ? 'Para confirmar sua identidade, saia e entre novamente com o mesmo método de login. Depois, tente excluir a conta novamente.'
        : code === 'auth/wrong-password' || code === 'auth/invalid-credential'
          ? 'Senha incorreta. Confira sua senha atual.'
          : code === 'functions/not-found'
            ? 'A exclusão de conta ainda não está disponível. Tente novamente mais tarde.'
          : code === 'auth/network-request-failed' || code === 'functions/unavailable'
            ? 'Sem conexão. Verifique sua internet e tente novamente.'
            : 'Não foi possível excluir sua conta. Tente novamente.';
      Alert.alert('Não foi possível excluir', message);
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }

  const close = () => { if (!busy.current) { setPassword(''); onClose(); } };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Excluir conta?</Text>
            <Text style={styles.description}>
              Esta ação é permanente. Você perderá o acesso à conta e seus dados de cadastro, portfólio, fotos e curtidas serão removidos.
            </Text>
            {needsPassword ? (
              <>
                <Text style={styles.label}>Confirme sua senha atual</Text>
                <TextInput
                  accessibilityLabel="Senha atual"
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                  editable={!deleting}
                  placeholder="Digite sua senha"
                />
              </>
            ) : <Text style={styles.description}>O Google poderá exigir que você entre novamente antes de excluir.</Text>}
            <Pressable
              accessibilityRole="button"
              disabled={deleting || (!!needsPassword && !password)}
              style={[styles.deleteButton, (deleting || (!!needsPassword && !password)) && styles.disabled]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteLabel}>{deleting ? 'Excluindo...' : 'Excluir minha conta definitivamente'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={deleting} style={styles.cancelButton} onPress={close}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
