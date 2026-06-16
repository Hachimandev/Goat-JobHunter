import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tag } from "@/types/model";

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: number[];
  onSelectTag: (tagId: number) => void;
  onDeselectTag: (tagId: number) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onSelectTag,
  onDeselectTag,
  onClose,
  isVisible,
}) => {
  const handleTagPress = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onDeselectTag(tagId);
    } else {
      onSelectTag(tagId);
    }
  };

  const renderTagItem = ({ item }: { item: Tag }) => {
    const isSelected = selectedTagIds.includes(item.tagId);

    return (
      <TouchableOpacity
        style={[
          styles.tagItem,
          {
            backgroundColor: item.color + "20",
            borderColor: item.color,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleTagPress(item.tagId)}
      >
        <View
          style={[
            styles.tagColorDot,
            {
              backgroundColor: item.color,
            },
          ]}
        />
        <Text style={styles.tagName}>{item.name}</Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={item.color}
            style={styles.checkmark}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn phân loại</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Tag List */}
          {tags.length > 0 ? (
            <FlatList
              data={tags.filter((tag) => !tag.systemTag)}
              keyExtractor={(item) => item.tagId.toString()}
              renderItem={renderTagItem}
              scrollEnabled={true}
              style={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có phân loại nào</Text>
            </View>
          )}

          {/* Footer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get("window").height * 0.7,
    paddingBottom: 16,
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
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  tagName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  closeButton: {
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
