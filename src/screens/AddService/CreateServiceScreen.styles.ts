import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    screen: { flex: 1, backgroundColor: "#F6F6F9" },
    content: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 110,
    },

    // Cabeçalho
    backButton: { flexDirection: "row", alignItems: "center", marginLeft: -6, marginBottom: 8 },
    backText: { color: "#111111", fontSize: 17, fontWeight: "600" },
    title: {
        color: "#0B0B0B",
        fontSize: 26,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
        letterSpacing: -0.4,
    },
    subtitle: { color: "#7D7D7D", fontSize: 14, marginTop: 4, marginBottom: 20 },

    // Cartões de seção
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 0.5,
        borderColor: "#EEEEEE",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: { color: "#0A0A0A", fontSize: 17, fontWeight: "700", fontFamily: "Poppins-Bold" },

    // Campos
    label: { color: "#333333", fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 8 },
    input: {
        backgroundColor: "#FAFAFC",
        borderColor: "#D5D5DB",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0A0A0A",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#FAFAFC",
        borderColor: "#D5D5DB",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
    },
    inputInner: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#0A0A0A" },
    inputText: { fontSize: 16, color: "#0A0A0A", paddingVertical: 12 },
    placeholderText: { fontSize: 16, color: "#9C9C9C", paddingVertical: 12 },
    textArea: { minHeight: 140 },
    counter: { alignSelf: "flex-end", color: "#9C9C9C", fontSize: 12, marginTop: 6 },
    hint: { color: "#7D7D7D", fontSize: 14 },
    locationText: { color: "#258344", fontSize: 14, fontWeight: "600", marginTop: 8 },

    // Chips
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        borderWidth: 1,
        borderColor: "#C9C9D1",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: "#FFFFFF",
    },
    chipSelected: { backgroundColor: "#5B69A3", borderColor: "#5B69A3" },
    chipText: { color: "#555555", fontSize: 14, fontWeight: "500" },
    chipTextSelected: { color: "#FFFFFF", fontWeight: "700" },

    // Fotos
    photo: { width: 92, height: 92, borderRadius: 14, marginTop: 14 },
    addPhoto: {
        borderWidth: 1.2,
        borderColor: "#B6B6B6",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAFAFC",
    },
    removeBadge: {
        position: "absolute",
        top: 6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#202020",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    // Envio
    submitWrapper: { marginTop: 8 },
    submitDisabled: { opacity: 0.5 },
    stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 },
    stepText: { color: "#5B69A3", fontSize: 14, fontWeight: "600" },
});