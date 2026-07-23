import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Professional } from '../../../types/home';
import { styles } from './ProfessionalCard.styles';

interface ProfessionalCardProps {
  professional: Professional;
  onPress?: (professional: Professional) => void;
}

export default function ProfessionalCard({
  professional,
  onPress,
}: ProfessionalCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: professional.avatarUrl }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {professional.name}
        </Text>

        <View style={styles.cityRow}>
          <Text style={styles.city} numberOfLines={1}>
            {professional.city}
          </Text>
          <Ionicons name="location-outline" size={14} color="#8A8A8E" />
        </View>

        {professional.hasCnpj && (
          <View style={styles.cnpjBadge}>
            <Ionicons name="star" size={12} color="#F5A623" />
            <Text style={styles.cnpjText}>Com CNPJ</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => onPress?.(professional)}
          activeOpacity={0.7}
        >
          <Text style={styles.ctaText}>Ver agora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
