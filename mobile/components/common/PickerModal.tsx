import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

type PickerOption = {
  value: string;
  label: string;
};

type PickerModalProps = {
  visible: boolean;
  options: PickerOption[];
  selectedValue?: string;
  selectedValues?: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
  placeholder?: string;
  multiSelect?: boolean;
};

export default function PickerModal({
  visible,
  options,
  selectedValue,
  selectedValues = [],
  onSelect,
  onClose,
  title,
  placeholder = 'Tìm kiếm...',
  multiSelect = false,
}: PickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = (value: string) => {
    onSelect(value);
    if (!multiSelect) {
      setSearchQuery(''); // Reset search
      onClose();
    }
  };

  const handleClose = () => {
    setSearchQuery(''); // Reset search
    onClose();
  };

  const isSelected = (value: string) => {
    if (multiSelect) {
      return selectedValues.includes(value);
    }
    return value === selectedValue;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Options List */}
        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.option,
                isSelected(item.value) && styles.selectedOption,
              ]}
              onPress={() => handleSelect(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected(item.value) && styles.selectedOptionText,
                ]}
              >
                {item.label}
              </Text>
              {isSelected(item.value) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  selectedOptionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

