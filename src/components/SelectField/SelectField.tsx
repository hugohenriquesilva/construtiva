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
import { SelectOption, toSelectOptions } from './selectOption';

interface SelectFieldProps {
  placeholder: string;
  value: string | null;
  options: (string | SelectOption)[];
  onSelect: (value: string) => void;
  error?: boolean;
}

export default function SelectField({
  placeholder,
  value,
  options,
  onSelect,
  error = false,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const normalizedOptions = toSelectOptions(options);
  const selectedLabel = normalizedOptions.find((o) => o.value === value)?.label ?? null;

  return (
    <View>
      <TouchableOpacity
        style={[styles.fieldButton, error && styles.fieldButtonError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={selectedLabel ? styles.fieldText : styles.placeholderText}>
          {selectedLabel ?? placeholder}
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
              data={normalizedOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
