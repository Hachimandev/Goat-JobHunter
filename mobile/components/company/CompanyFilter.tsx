import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { CompanyFilters } from '@/hooks/useCompaniesFilter';
import PickerModal from '../common/PickerModal';
import { LOCATION_OPTIONS } from '@/constants/constant';
import { ChevronDown, ChevronRight, Check } from 'lucide-react-native';

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
  const [showVerifiedFilter, setShowVerifiedFilter] = useState(false);

  const selectedLocations = filters.addresses || [];
  const isVerifiedSelected = filters.verified === true;

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

  const handleVerifiedToggle = () => {
    onFilterChange({ verified: isVerifiedSelected ? undefined : true });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tìm Kiếm Công Ty</Text>
          <Text style={styles.subtitle}>Lọc công ty theo nhu cầu của bạn</Text>
        </View>
        {activeFiltersCount > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={onResetFilters}>
            <Text style={styles.resetButtonText}>Xóa lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Name Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tên công ty</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên công ty..."
          value={nameInputValue}
          onChangeText={(text) => {
            onNameInputChange(text);
            onFilterChange({ name: text });
          }}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Location Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Địa điểm</Text>
          {selectedLocations.length > 0 && (
            <Text style={styles.selectedBadge}>{selectedLocations.length}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocationPicker(true)}
        >
          <Text style={styles.filterButtonText}>{locationLabel}</Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Verified Status Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trạng thái xác minh</Text>
        </View>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleVerifiedToggle}
        >
          <View style={[styles.checkbox, isVerifiedSelected && styles.checkboxSelected]}>
            {isVerifiedSelected && <Check size={14} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Chỉ hiển thị công ty đã xác minh</Text>
        </TouchableOpacity>
      </View>

      {/* Location Picker Modal */}
      <PickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        title="Chọn địa điểm"
        options={LOCATION_OPTIONS}
        selectedValues={selectedLocations}
        onSelect={handleLocationSelect}
        multiSelect
      />

      {/* Filter Count Badge */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBadge}>
          <Text style={styles.activeFiltersText}>Đang lọc: {activeFiltersCount} bộ lọc</Text>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  resetButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedBadge: {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
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
  filterButton: {
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
  filterButtonText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  filterIcon: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  activeFiltersBadge: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '500',
  },
});

