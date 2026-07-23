import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from './PhotoUploadBox.styles';

interface PhotoUploadBoxProps {
  size: number;
  uri?: string | null;
  onPress?: () => void;
}

export default function PhotoUploadBox({
  size,
  uri,
  onPress,
}: PhotoUploadBoxProps) {
  return (
    <TouchableOpacity
      style={[styles.box, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Ionicons name="add" size={size * 0.4} color="#1A1A1A" />
      )}
    </TouchableOpacity>
  );
}
