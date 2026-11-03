import { StyleSheet } from "react-native";

// Layout da tela e dos cards reaproveitado de ProfessionsAdmin e BuscaPortfolio;
// aqui ficam só os elementos próprios da lista de denúncias.
export const styles = StyleSheet.create({
    countBadge: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#FDECEA",
        borderRadius: 16,
        flexDirection: "row",
        gap: 4,
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    countText: {
        color: "#B3261E",
        fontSize: 13,
        fontWeight: "700",
    },
    deletedText: {
        color: "#B3261E",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    tabs: {
        backgroundColor: "#F2F2F2",
        borderRadius: 12,
        flexDirection: "row",
        marginBottom: 12,
        padding: 4,
    },
    tab: {
        alignItems: "center",
        borderRadius: 9,
        flex: 1,
        paddingVertical: 9,
    },
    tabActive: {
        backgroundColor: "#FFFFFF",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    tabText: { color: "#7D7D7D", fontSize: 14, fontWeight: "700" },
    tabTextActive: { color: "#5B69A3" },
    serviceThumb: { borderRadius: 12 },
    closedText: {
        color: "#7A7A7A",
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 2,
        textTransform: "uppercase",
    },
    retryText: {
        color: "#5B69A3",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 12,
        textAlign: "center",
    },
});