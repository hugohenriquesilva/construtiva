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
    retryText: {
        color: "#5B69A3",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 12,
        textAlign: "center",
    },
});