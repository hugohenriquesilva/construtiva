import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from './SelectField.styles';

interface SelectFieldProps {
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
}

export default function SelectField({
  placeholder,
  value,
  options,
  onSelect,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.fieldButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.fieldText : styles.placeholderText}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#1A1A1A" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
