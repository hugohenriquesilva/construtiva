import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ServiceDocument, serviceDateToDate } from "../../services/serviceService";
import { styles } from "./ServiceCard.styles";

type Props = {
  service: ServiceDocument;
  onPress: (service: ServiceDocument) => void;
};

function formatPublishedDate(value: ServiceDocument["createdAt"]): string | null {
  const date = serviceDateToDate(value);
  if (!date) return null;
  return date.toLocaleDateString("pt-BR");
}

export default function ServiceCard({ service, onPress }: Props) {
  const imageUri = service.photos[0];
  const [imageStatus, setImageStatus] = useState<{
    uri: string | undefined;
    status: "loading" | "loaded" | "error";
  }>({ uri: imageUri, status: imageUri ? "loading" : "error" });
  const publishedDate = formatPublishedDate(service.createdAt);
  const imageState = imageStatus.uri === imageUri
    ? imageStatus.status
    : imageUri ? "loading" : "error";

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(service)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do serviço ${service.title || "sem título"}`}
    >
      {imageUri && imageState !== "error" ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            onLoad={() => setImageStatus({ uri: imageUri, status: "loaded" })}
            onError={() => {
              console.warn("Não foi possível carregar a foto do serviço no card.");
              setImageStatus({ uri: imageUri, status: "error" });
            }}
          />
          {imageState === "loading" && (
            <View style={styles.imageLoading}>
              <ActivityIndicator color="#5B69A3" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={38} color="#8A8A8E" />
          <Text style={styles.placeholderText}>Sem foto</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <Text style={[styles.status, service.status !== "open" && styles.closedStatus]}>
            {service.status === "open" ? "Aberto" : "Encerrado"}
          </Text>
          {publishedDate && <Text style={styles.date}>{publishedDate}</Text>}
        </View>
        <Text style={styles.title} numberOfLines={2}>{service.title || "Serviço sem título"}</Text>
        {(!!service.areas.length || !!service.location) && (
          <View style={styles.detailsRow}>
            {!!service.areas.length && (
              <Text style={styles.meta} numberOfLines={2}>
                {service.areas.join(" • ")}
              </Text>
            )}
            {!!service.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={15} color="#777777" />
                <Text style={styles.locationText}>{service.location}</Text>
              </View>
            )}
          </View>
        )}
        {!!service.description && (
          <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.details}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={18} color="#5B69A3" />
        </View>
      </View>
    </Pressable>
  );
}
