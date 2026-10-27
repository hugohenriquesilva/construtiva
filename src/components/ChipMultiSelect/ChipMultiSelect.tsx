import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, AccessibilityInfo } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from './ChipMultiSelect.styles';

interface ChipMultiSelectProps {
  options: string[];
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

  const [showLimitNotice, setShowLimitNotice] = useState(false);
  const limitMessage = `Limite de ${maxSelected} profissões. Remova uma para adicionar outra.`;

  const isAddDisabled = maxSelected !== undefined && selected.length >= maxSelected;

  useEffect(() => {
    if (!showLimitNotice) return;
    if (!isAddDisabled) {
      setShowLimitNotice(false);
      return;
    }
    const timeout = setTimeout(() => setShowLimitNotice(false), 3000);
    return () => clearTimeout(timeout);
  }, [showLimitNotice, isAddDisabled]);

  const openModal = () => {
    if (isAddDisabled) {
      setShowLimitNotice(true);
      AccessibilityInfo.announceForAccessibility(limitMessage);
      return;
    }
    setShowLimitNotice(false);
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
    setShowLimitNotice(false);
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
          style={[styles.addChip, isAddDisabled && styles.addChipDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: isAddDisabled }}
          accessibilityHint={isAddDisabled ? limitMessage : undefined}
          onPress={openModal}
          activeOpacity={0.7}
        >
          <Text style={styles.addChipText}>adicionar +</Text>
        </TouchableOpacity>
      </View>
      {showLimitNotice && isAddDisabled && (
        <Text style={styles.selectionHint}>{limitMessage}</Text>
      )}

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
                const isDisabled = !isChecked && maxSelected !== undefined && draft.length >= maxSelected;
                return (
                  <TouchableOpacity
                    style={styles.option}
                    disabled={isDisabled}
                    accessibilityState={{ checked: isChecked, disabled: isDisabled }}
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
