import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', padding: 24 },
  title: { color: '#0B0B0B', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { color: '#0A0A0A', fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderColor: '#C7C7C7', borderRadius: 12, borderWidth: 1, color: '#0B0B0B', fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 },
  hint: { color: '#7D7D7D', fontSize: 13, fontWeight: '500', marginTop: 6 },
  hintError: { color: '#D9534F' },
  buttonWrapper: { marginTop: 24 },
  cancelButton: { alignItems: 'center', marginTop: 12, paddingVertical: 10 },
  cancelLabel: { color: '#7D7D7D', fontSize: 15, fontWeight: '600' },
});
