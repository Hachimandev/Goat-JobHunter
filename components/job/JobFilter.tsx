import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Level, WorkingType } from '@/types/enum';
import { ChevronDown, ChevronRight, Check } from 'lucide-react-native';

interface JobFilterProps {
  levels: string[];
  workingTypes: string[];
  provinces?: string[];
  selectedLevels: string[];
  selectedWorkingTypes: string[];
  selectedProvinces?: string[];
  selectedSkills: string[];
  onLevelChange: (level: string) => void;
  onWorkingTypeChange: (type: string) => void;
  onProvinceChange?: (province: string) => void;
  onSkillChange: (skill: string) => void;
  onSkillInputChange?: (text: string) => void;
  onReset: () => void;
  skills: Array<{ skillId: number; name: string }>;
  isFetchingSkills?: boolean;
  skillInputValue?: string;
}

export const JobFilter: React.FC<JobFilterProps> = ({
  levels,
  workingTypes,
  provinces,
  selectedLevels,
  selectedWorkingTypes,
  selectedProvinces,
  selectedSkills,
  onLevelChange,
  onWorkingTypeChange,
  onProvinceChange,
  onSkillChange,
  onSkillInputChange,
  onReset,
  skills,
  isFetchingSkills,
  skillInputValue,
}) => {
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSkillFilter, setShowSkillFilter] = useState(false);
  const [showProvinceFilter, setShowProvinceFilter] = useState(false);

  const levelOptions = Object.values(Level);
  const typeOptions = Object.values(WorkingType);
  const provinceOptions = provinces || [];

  const activeFiltersCount =
    selectedLevels.length + selectedWorkingTypes.length + selectedSkills.length + (selectedProvinces?.length || 0);

  const renderMultiSelect = (
    title: string,
    options: string[],
    selectedItems: string[],
    onItemToggle: (item: string) => void,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
  ) => (
    <View style={styles.filterSection}>
      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.filterTitle}>
          {title}
          {selectedItems.length > 0 && (
            <Text style={styles.selectedCount}> ({selectedItems.length})</Text>
          )}
        </Text>
        {isOpen ? (
          <ChevronDown size={18} color="#6b7280" />
        ) : (
          <ChevronRight size={18} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => onItemToggle(option)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedItems.includes(option) && styles.checkboxSelected,
                ]}
              >
                {selectedItems.includes(option) && (
                  <Check size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Lọc theo ({activeFiltersCount})
        </Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={onReset}>
            <Text style={styles.resetButton}>Xóa lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level Filter */}
        {renderMultiSelect(
          'Cấp độ',
          levelOptions,
          selectedLevels,
          onLevelChange,
          showLevelFilter,
          setShowLevelFilter,
        )}

        {/* Working Type Filter */}
        {renderMultiSelect(
          'Loại công việc',
          typeOptions,
          selectedWorkingTypes,
          onWorkingTypeChange,
          showTypeFilter,
          setShowTypeFilter,
        )}

        {/* Province Filter */}
        {provinceOptions.length > 0 &&
          renderMultiSelect(
            'Tỉnh/Thành phố',
            provinceOptions,
            selectedProvinces || [],
            onProvinceChange || (() => {}),
            showProvinceFilter,
            setShowProvinceFilter,
          )}

        {/* Skill Filter */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterHeader}
            onPress={() => setShowSkillFilter(!showSkillFilter)}
          >
            <Text style={styles.filterTitle}>
              Kỹ năng
              {selectedSkills.length > 0 && (
                <Text style={styles.selectedCount}>
                  {' '}
                  ({selectedSkills.length})
                </Text>
              )}
            </Text>
            {showSkillFilter ? (
              <ChevronDown size={18} color="#6b7280" />
            ) : (
              <ChevronRight size={18} color="#6b7280" />
            )}
          </TouchableOpacity>

          {showSkillFilter && (
            <View style={styles.skillFilterContent}>
              <TextInput
                style={styles.skillInput}
                placeholder="Tìm kiếm kỹ năng..."
                placeholderTextColor="#9ca3af"
                value={skillInputValue}
                onChangeText={onSkillInputChange}
              />

              {isFetchingSkills ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1976d2" />
                </View>
              ) : (
                <FlatList
                  data={skills}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => onSkillChange(item.name)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selectedSkills.includes(item.name) &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selectedSkills.includes(item.name) && (
                          <Check size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.skillId.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  resetButton: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  content: {
    maxHeight: 400,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  selectedCount: {
    color: '#1976d2',
    fontWeight: '600',
  },
  toggleIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterOptions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#f9fafb',
  },
  skillFilterContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#f9fafb',
  },
  optionButton: {
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
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  skillInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  loadingContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
