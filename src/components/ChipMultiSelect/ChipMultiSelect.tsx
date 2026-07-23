import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from './ChipMultiSelect.styles';

interface ChipMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ChipMultiSelect({
  options,
  selected,
  onChange,
}: ChipMultiSelectProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);

  const openModal = () => {
    setDraft(selected);
    setVisible(true);
  };

  const toggleDraft = (item: string) => {
    setDraft((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const removeChip = (item: string) => {
    onChange(selected.filter((v) => v !== item));
  };

  const confirm = () => {
    onChange(draft);
    setVisible(false);
  };

  return (
    <View>
      <View style={styles.chipsRow}>
        {selected.map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
            <TouchableOpacity onPress={() => removeChip(item)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addChip}
          onPress={openModal}
          activeOpacity={0.7}
        >
          <Text style={styles.addChipText}>adicionar +</Text>
        </TouchableOpacity>
      </View>

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
              renderItem={({ item }) => {
                const isChecked = draft.includes(item);
                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => toggleDraft(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                    <Ionicons
                      name={isChecked ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isChecked ? '#5B69A3' : '#9B9B9B'}
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.doneButton} onPress={confirm}>
              <Text style={styles.doneButtonText}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
