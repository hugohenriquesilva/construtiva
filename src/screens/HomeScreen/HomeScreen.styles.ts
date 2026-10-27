import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    profileCard: {
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E2E2E5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    profileHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    profileAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    profileAvatarImage: { position: 'absolute', width: 48, height: 48 },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    profileLocation: { fontSize: 13, color: '#666666', marginTop: 4 },
    profileProfession: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    profileSecondary: { fontSize: 13, color: '#666666', marginTop: 4 },
    profileDescription: { fontSize: 13, lineHeight: 20, color: '#666666', marginTop: 8 },
    profileFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' },
    profileLikes: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    profileLikesText: { fontSize: 12, color: '#8A8A8E' },
    profileLink: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        marginBottom: 24,
    },
    headerTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
        color: '#1A1A1A',
        marginLeft: 8,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A1A',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    carouselMessage: {
        fontSize: 14,
        color: '#8A8A8E',
        paddingVertical: 12,
    },
    retryText: {
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
        paddingVertical: 8,
    },
    carousel: {
        marginBottom: 10,
    },
    carouselContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
    },
    feedTitle: {
        marginTop: 4,
    },
    feedContent: {
        paddingBottom: 12,
    },
});
