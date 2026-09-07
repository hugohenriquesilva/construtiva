import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    screen: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 96 },
    title: { color: '#0B0B0B', fontSize: 23, fontWeight: '700', letterSpacing: -0.4, marginBottom: 34 },
    optionList: { gap: 22 },
    optionButton: { alignItems: 'center', borderColor: '#8D8D8D', borderRadius: 15, borderWidth: 1.2, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 40 },
    optionLabel: { color: '#0A0A0A', fontSize: 18, fontWeight: '700' },
    badge: { borderRadius: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4 },
    activeBadge: { backgroundColor: '#258344' },
    inactiveBadge: { backgroundColor: '#777777' },
});
