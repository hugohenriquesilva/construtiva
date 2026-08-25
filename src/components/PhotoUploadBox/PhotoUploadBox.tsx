import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from './PhotoUploadBox.styles';

interface PhotoUploadBoxProps {
  size: number;
  uri?: string | null;
  onPress?: () => void;
  error?: boolean;
  overlayIcon?: 'pencil' | 'trash';
  onOverlayPress?: () => void;
}

export default function PhotoUploadBox({
  size,
  uri,
  onPress,
  error = false,
  overlayIcon,
  onOverlayPress,
}: PhotoUploadBoxProps) {
  return (
    <View style={{ width: size, height: size }}>
      <TouchableOpacity
        style={[
          styles.box,
          { width: size, height: size },
          error && styles.boxError,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <Ionicons name="add" size={size * 0.4} color="#1A1A1A" />
        )}
      </TouchableOpacity>

      {overlayIcon && (
        <TouchableOpacity
          style={[
            styles.overlayBadge,
            overlayIcon === 'trash' && styles.overlayBadgeTrash,
          ]}
          onPress={onOverlayPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={overlayIcon === 'pencil' ? 'pencil' : 'trash'}
            size={14}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
