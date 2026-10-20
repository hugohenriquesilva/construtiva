import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    screen: { flex: 1, backgroundColor: "#FFFFFF" },
    content: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 34,
        paddingBottom: 96,
    },
    title: {
        color: "#0B0B0B",
        fontSize: 23,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
        letterSpacing: -0.4,
        marginBottom: 8,
    },

    // Campos
    label: {
        color: "#0A0A0A",
        fontSize: 15,
        fontWeight: "700",
        marginTop: 22,
        marginBottom: 8,
    },
    input: {
        borderColor: "#8D8D8D",
        borderWidth: 1.2,
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0A0A0A",
    },
    inputText: { fontSize: 16, color: "#0A0A0A" },
    placeholderText: { fontSize: 16, color: "#9C9C9C" },
    textArea: { minHeight: 130 },
    hint: { color: "#7D7D7D", fontSize: 14, marginTop: 6 },

    // Chips (áreas e profissões)
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        borderWidth: 1,
        borderColor: "#B6B6B6",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: "#FFFFFF",
    },
    chipSelected: { backgroundColor: "#5B69A3", borderColor: "#5B69A3" },
    chipText: { color: "#555555", fontSize: 14, fontWeight: "500" },
    chipTextSelected: { color: "#FFFFFF", fontWeight: "700" },

    // Botão da IA
    rewriteButton: {
        alignSelf: "flex-end",
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        minWidth: 120,
        alignItems: "center",
    },
    rewriteText: { color: "#5B69A3", fontSize: 14, fontWeight: "700" },

    // Fotos
    photo: { width: 90, height: 90, borderRadius: 14 },
    addPhoto: {
        borderWidth: 1.2,
        borderColor: "#8D8D8D",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
    addPhotoText: { fontSize: 32, color: "#8D8D8D" },

    submitWrapper: { marginTop: 32 },
});