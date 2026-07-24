import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    screen: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 96 },
    header: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 34 },
    title: { color: '#0B0B0B', fontSize: 23, fontWeight: '700', letterSpacing: -0.4 },
    profileCard: { alignItems: 'center', borderColor: '#888888', borderRadius: 16, borderWidth: 1.2, flexDirection: 'row', minHeight: 112, paddingHorizontal: 20 },
    avatar: { alignItems: 'center', backgroundColor: '#B68108', borderRadius: 32, height: 64, justifyContent: 'center', marginRight: 16, width: 64 },
    avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    profileInfo: { flex: 1, minWidth: 0 },
    profileName: { color: '#080808', fontSize: 20, fontWeight: '700', marginBottom: 2 },
    profileDetail: { color: '#7D7D7D', flexShrink: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
    menuList: { gap: 22, marginTop: 28 },
    menuButton: { alignItems: 'center', borderColor: '#8D8D8D', borderRadius: 15, borderWidth: 1.2, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52, paddingHorizontal: 40 },
    menuLabel: { color: '#0A0A0A', fontSize: 18, fontWeight: '700' },
    badge: { borderRadius: 8, color: '#FFFFFF', fontSize: 15, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4 },
    activeBadge: { backgroundColor: '#258344' },
    inactiveBadge: { backgroundColor: '#777777' },
    signOutButton: { borderColor: '#888888', borderRadius: 15, borderWidth: 1.2, marginHorizontal: 3, marginTop: 22, minHeight: 53, paddingHorizontal: 40, justifyContent: 'center' },
    signOutLabel: { color: '#E10B0B', fontSize: 18, fontWeight: '700' },
});