import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { getEmptyStateMascotSize } from "@/src/utils/emptyStateMascot";
import { styles } from "./EmptyStateMessage.styles";

type Props = {
  title: string;
  description: string;
  mascotSource: ImageSourcePropType;
  mascotAspectRatio?: number;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "primary" | "link";
};

export default function EmptyStateMessage({
  title,
  description,
  mascotSource,
  mascotAspectRatio,
  actionLabel,
  onAction,
  actionVariant = "primary",
}: Props) {
  const { width } = useWindowDimensions();
  const [availableHeight, setAvailableHeight] = useState(0);
  const mascotSize = getEmptyStateMascotSize(
    width,
    availableHeight,
    mascotAspectRatio,
  );

  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent }) => {
        setAvailableHeight((current) =>
          Math.abs(current - nativeEvent.layout.height) > 1
            ? nativeEvent.layout.height
            : current,
        );
      }}
    >
      <Image
        source={require("../../../assets/images/background.png")}
        style={[StyleSheet.absoluteFill, styles.backgroundImage]}
        resizeMode="cover"
      />
      <Text style={styles.title} maxFontSizeMultiplier={1.4}>
        {title}
      </Text>
      <Text style={styles.description} maxFontSizeMultiplier={1.4}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          accessibilityRole="button"
          style={actionVariant === "primary" ? styles.primaryAction : styles.linkAction}
          onPress={onAction}
        >
          <Text
            style={actionVariant === "primary" ? styles.primaryActionText : styles.linkActionText}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
