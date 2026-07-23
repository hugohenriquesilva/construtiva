import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A1A',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    carousel: {
        marginBottom: 28,
    },
    carouselContent: {
        paddingHorizontal: 20,
    },
    feedTitle: {
        marginTop: 4,
    },
    feedContent: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
});
