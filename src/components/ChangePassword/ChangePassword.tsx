import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

import { auth } from '@/firebaseConfig';
import GradientButton from '../GradientButton/GradientButton';
import { styles } from './ChangePassword.styles';

const GRADIENT_COLORS: [string, string] = ['rgba(91, 105, 163, 1)', 'rgba(210, 110, 56, 1)'];

interface ChangePasswordProps {
  visible: boolean;
  onClose: () => void;
}

// Ao menos 8 caracteres, um número e um caractere especial
function isValidNewPassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export default function ChangePassword({ visible, onClose }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [visible]);

  const canSave =
    currentPassword.length > 0 &&
    isValidNewPassword(newPassword) &&
    confirmPassword === newPassword;

  async function handleSave() {
    const user = auth.currentUser;
    if (!user?.email || saving || !canSave) return;

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso.');
      onClose();
    } catch (error: any) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        Alert.alert('Erro', 'Senha atual incorreta.');
      } else {
        console.error('Erro ao alterar senha:', error);
        Alert.alert('Erro', 'Não foi possível alterar sua senha. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Alterar senha</Text>

            <Text style={styles.label}>Senha atual</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#9B9B9B"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a nova senha"
              placeholderTextColor="#9B9B9B"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Text
              style={[
                styles.hint,
                newPassword.length > 0 && !isValidNewPassword(newPassword) && styles.hintError,
              ]}
            >
              Mínimo de 8 caracteres, com pelo menos um número e um caractere especial.
            </Text>

            <Text style={styles.label}>Confirmar nova senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme a nova senha"
              placeholderTextColor="#9B9B9B"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <Text style={[styles.hint, styles.hintError]}>As senhas não coincidem.</Text>
            )}

            <View style={styles.buttonWrapper}>
              <GradientButton
                label={saving ? 'Salvando...' : 'Salvar alterações'}
                colors={GRADIENT_COLORS}
                onPress={handleSave}
                disabled={!canSave || saving}
              />
            </View>

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
