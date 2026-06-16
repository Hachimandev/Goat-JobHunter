import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_OPTIONS } from "@/constants/constant";
import { Tag, ChatRoom } from "@/types/model";
import { useFetchRoomIdsByTagQuery } from "@/services/tag/tagApi";

interface TagFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tagName: string, color: string, roomIds: number[]) => Promise<boolean>;
  /** Called after successful create/update so TagManager can show Toast */
  onSuccess?: (message: string) => void;
  tag?: Tag;
  allRooms: ChatRoom[];
  isLoading?: boolean;
  /** Full tags list for duplicate name validation */
  allTags?: Tag[];
}

export const TagForm: React.FC<TagFormProps> = ({
  visible,
  onClose,
  onSubmit,
  onSuccess,
  tag,
  allRooms,
  isLoading = false,
  allTags = [],
}) => {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Fetch assigned room IDs when editing an existing tag
  const { data: assignedRoomIdsResponse, isFetching: isFetchingRooms } = useFetchRoomIdsByTagQuery(
    tag?.tagId ?? -1,
    { skip: !visible || !tag }
  );

  useEffect(() => {
    if (visible) {
      if (tag) {
        setTagName(tag.name);
        setSelectedColor(tag.color);
      } else {
        setTagName("");
        setSelectedColor(COLOR_OPTIONS[0]);
        setSelectedRoomIds([]);
      }
    }
  }, [visible, tag]);

  // Sync assigned rooms once fetched
  useEffect(() => {
    if (tag && assignedRoomIdsResponse?.data) {
      setSelectedRoomIds(assignedRoomIdsResponse.data);
    }
  }, [tag, assignedRoomIdsResponse]);

  // Duplicate name validation (skip comparing with the tag being edited)
  const isDuplicateName = useMemo(() => {
    const normalized = tagName.trim().toLowerCase();
    if (!normalized) return false;
    if (tag && normalized === tag.name.trim().toLowerCase()) return false;
    return allTags.some((t) => t.name.trim().toLowerCase() === normalized);
  }, [tagName, allTags, tag]);

  const isSubmitting = isLoading || isFetchingRooms;

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      Alert.alert("Lỗi", "Tên phân loại không được để trống");
      return;
    }

    if (isDuplicateName) {
      Alert.alert("Lỗi", "Tên phân loại đã tồn tại");
      return;
    }

    const success = await onSubmit(tagName, selectedColor, selectedRoomIds);
    if (success) {
      onSuccess?.(tag ? "Cập nhật thẻ thành công" : "Tạo thẻ thành công");
      handleClose();
    }
  };

  const handleClose = () => {
    setTagName("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedRoomIds([]);
    setShowColorPicker(false);
    setShowRoomSelector(false);
    onClose();
  };

  const toggleRoom = (roomId: number) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const renderColorOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        {
          backgroundColor: item,
          borderWidth: selectedColor === item ? 3 : 0,
          borderColor: "#1f2937",
        },
      ]}
      onPress={() => {
        setSelectedColor(item);
        setShowColorPicker(false);
      }}
      disabled={isSubmitting}
    />
  );

  const renderRoomItem = ({ item }: { item: ChatRoom }) => {
    const isSelected = selectedRoomIds.includes(item.roomId);
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => toggleRoom(item.roomId)}
        disabled={isSubmitting}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? "#3b82f6" : "#fff",
              borderColor: isSelected ? "#3b82f6" : "#d1d5db",
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <Text style={styles.roomName} numberOfLines={1}>
          {item.name || `Phòng chat #${item.roomId}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {visible && (
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          disabled={isSubmitting}
        >
          <Pressable
            style={styles.overlay}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {tag ? "Chỉnh sửa phân loại" : "Tạo phân loại"}
              </Text>
              <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isSubmitting}
              nestedScrollEnabled={true}
            >
              {/* Tag Name Input */}
              <View style={styles.section}>
                <Text style={styles.label}>Tên phân loại</Text>
                <TextInput
                  style={[styles.input, isDuplicateName && styles.inputError]}
                  placeholder="Nhập tên phân loại"
                  value={tagName}
                  onChangeText={setTagName}
                  editable={!isSubmitting}
                  maxLength={50}
                />
                {isDuplicateName && (
                  <Text style={styles.errorText}>Tên phân loại đã tồn tại</Text>
                )}
              </View>

              {/* Color Picker */}
              <View style={styles.section}>
                <Text style={styles.label}>Màu sắc</Text>
                <TouchableOpacity
                  style={[styles.colorPreview, { backgroundColor: selectedColor }]}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>

                {showColorPicker && (
                  <FlatList
                    data={COLOR_OPTIONS}
                    numColumns={6}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderColorOption}
                    scrollEnabled={false}
                    style={styles.colorGrid}
                    removeClippedSubviews={true}
                  />
                )}
              </View>

              {/* Room Selection */}
              <View style={styles.section}>
                <View style={styles.roomSectionHeader}>
                  <Text style={styles.label}>Áp dụng cho phòng chat</Text>
                  <Text style={styles.selectedCount}>
                    {selectedRoomIds.length > 0 ? `${selectedRoomIds.length} được chọn` : ""}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.roomToggleButton}
                  onPress={() => setShowRoomSelector(!showRoomSelector)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.roomToggleText}>
                    {showRoomSelector ? "Thu gọn" : "Chọn phòng chat"}
                  </Text>
                  <Ionicons
                    name={showRoomSelector ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#3b82f6"
                  />
                </TouchableOpacity>

                {showRoomSelector && (
                  <FlatList
                    data={allRooms}
                    keyExtractor={(item) => item.roomId.toString()}
                    renderItem={renderRoomItem}
                    scrollEnabled={false}
                    style={styles.roomList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={20}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={20}
                  />
                )}
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "Đang xử lý..." : tag ? "Cập nhật" : "Tạo"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer - End */}
          </View>
          {/* Container - End */}
            </Pressable>
          </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 9999,
  } as any,
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: Dimensions.get("window").height * 0.85,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  colorPreview: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    borderRadius: 8,
  },
  colorGrid: {
    marginTop: 12,
  },
  colorOption: {
    flex: 1,
    height: 50,
    margin: 6,
    borderRadius: 8,
  },
  roomSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  roomToggleButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  roomToggleText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  roomList: {
    marginTop: 12,
    maxHeight: 300,
  },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roomName: {
    fontSize: 14,
    color: "#1f2937",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
