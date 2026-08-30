import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './GradientButton.styles';

interface GradientButtonProps {
  label: string;
  colors: [string, string];
  onPress?: () => void;
  disabled?: boolean;
}

export default function GradientButton({
  label,
  colors,
  onPress,
  disabled,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.gradientDisabled]}
      >
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
