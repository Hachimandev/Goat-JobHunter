import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { CompanyFilters } from '@/hooks/useCompaniesFilter';
import PickerModal from '../common/PickerModal';
import { LOCATION_OPTIONS } from '@/constants/constant';

interface CompanyFilterProps {
  filters: CompanyFilters;
  onFilterChange: (filters: Partial<CompanyFilters>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  nameInputValue: string;
  onNameInputChange: (value: string) => void;
}

export default function CompanyFilter({
  filters,
  onFilterChange,
  onResetFilters,
  activeFiltersCount,
  nameInputValue,
  onNameInputChange,
}: CompanyFilterProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const selectedLocations = filters.addresses || [];
  const locationLabel =
    selectedLocations.length === 0
      ? 'Chọn địa điểm...'
      : selectedLocations.length === 1
      ? selectedLocations[0]
      : `${selectedLocations.length} địa điểm`;

  const handleLocationSelect = (value: string) => {
    const newAddresses = selectedLocations.includes(value)
      ? selectedLocations.filter((addr) => addr !== value)
      : [...selectedLocations, value];
    onFilterChange({ addresses: newAddresses });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Trải nghiệm về công ty của bạn?</Text>
          <Text style={styles.subtitle}>
            Review ẩn danh của bạn sẽ giúp hàng triệu người đang tìm kiếm việc làm
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.resetButton, activeFiltersCount === 0 && styles.resetButtonDisabled]}
          onPress={onResetFilters}
          disabled={activeFiltersCount === 0}
        >
          <Text style={[styles.resetButtonText, activeFiltersCount === 0 && styles.resetButtonTextDisabled]}>
            ✕ Xóa bộ lọc ({activeFiltersCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.filterItem}>
          <TextInput
            style={styles.input}
            placeholder="Tên công ty..."
            value={nameInputValue}
            onChangeText={(text) => {
              onNameInputChange(text);
              onFilterChange({ name: text });
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity style={styles.filterItem} onPress={() => setShowLocationPicker(true)}>
          <View style={styles.pickerButton}>
            <Text style={[styles.pickerButtonText, selectedLocations.length === 0 && styles.placeholderText]}>
              {locationLabel}
            </Text>
            <Text style={styles.pickerIcon}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      <PickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        title="Chọn địa điểm"
        options={LOCATION_OPTIONS}
        selectedValues={selectedLocations}
        onSelect={handleLocationSelect}
        multiSelect
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  headerTextContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  resetButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resetButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  resetButtonTextDisabled: {
    color: '#9ca3af',
  },
  filtersRow: {
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  pickerButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  pickerIcon: {
    fontSize: 10,
    color: '#6b7280',
  },
});

