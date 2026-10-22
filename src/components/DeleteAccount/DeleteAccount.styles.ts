import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#0B0B0B', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22, color: '#666666', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 12, padding: 14, fontSize: 16 },
  deleteButton: { backgroundColor: '#B42318', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  deleteLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelLabel: { color: '#666666', fontSize: 15, fontWeight: '600' },
});
