import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from './ChipMultiSelect.styles';
import { SelectOption, toSelectOptions } from '../SelectField/selectOption';

interface ChipMultiSelectProps {
  options: (string | SelectOption)[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelected?: number;
}

export default function ChipMultiSelect({
  options,
  selected,
  onChange,
  maxSelected,
}: ChipMultiSelectProps) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const normalizedOptions = toSelectOptions(options);
  const labelOf = (value: string) =>
    normalizedOptions.find((o) => o.value === value)?.label ?? value;
  const limitReached = maxSelected !== undefined && draft.length >= maxSelected;

  const openModal = () => {
    setDraft(selected);
    setVisible(true);
  };

  const toggleDraft = (item: string) => {
    setDraft((prev) => {
      if (prev.includes(item)) return prev.filter((v) => v !== item);
      if (maxSelected !== undefined && prev.length >= maxSelected) return prev;
      return [...prev, item];
    });
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
            <Text style={styles.chipText}>{labelOf(item)}</Text>
            <TouchableOpacity onPress={() => removeChip(item)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        {(maxSelected === undefined || selected.length < maxSelected) && (
          <TouchableOpacity
            style={styles.addChip}
            onPress={openModal}
            activeOpacity={0.7}
          >
            <Text style={styles.addChipText}>adicionar +</Text>
          </TouchableOpacity>
        )}
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
            {maxSelected !== undefined && (
              <Text style={styles.limitText}>
                Selecionadas {draft.length} de {maxSelected}
              </Text>
            )}
            <FlatList
              data={normalizedOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isChecked = draft.includes(item.value);
                const disabled = !isChecked && limitReached;
                return (
                  <TouchableOpacity
                    style={[styles.option, disabled && styles.optionDisabled]}
                    onPress={() => toggleDraft(item.value)}
                    disabled={disabled}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
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
