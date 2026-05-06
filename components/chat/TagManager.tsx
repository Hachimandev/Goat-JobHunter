import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tag } from "@/types/model";
import { TagForm } from "./TagForm";
import {
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useAssignTagMutation,
} from "@/services/tag/tagApi";
import { Toast } from "react-native-toast-notifications";
import { ChatRoom } from "@/types/model";

/** Show toast safely; falls back to Alert if ToastProvider not mounted */
const showToast = (text1: string, text2: string) => {
  InteractionManager.runAfterInteractions(() => {
    if (Toast?.show) {
      Toast.show({ type: "success", text1, text2 });
    } else {
      Alert.alert(text1, text2);
    }
  });
};

interface TagManagerProps {
  visible: boolean;
  onClose: () => void;
  tags: Tag[];
  chatRooms: ChatRoom[];
  isLoadingTags?: boolean;
}

export const TagManager: React.FC<TagManagerProps> = ({
  visible,
  onClose,
  tags,
  chatRooms,
  isLoadingTags = false,
}) => {
  const [tagFormVisible, setTagFormVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);

  // Direct mutations — fresh tags from props, no stale closure
  const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTag }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeletingTag }] = useDeleteTagMutation();
  const [assignTag, { isLoading: isAssigningTag }] = useAssignTagMutation();

  const isLoading =
    isCreatingTag || isUpdatingTag || isDeletingTag || isAssigningTag;

  const handleCreateTag = async (name: string, color: string) => {
    const result = await createTag({ name, color }).unwrap();
    return result.data;
  };

  const handleUpdateTag = async (tagId: number, name: string, color: string) => {
    await updateTag({ tagId, name, color }).unwrap();
    return true;
  };

  const handleDeleteTag = async (tagId: number) => {
    await deleteTag(tagId).unwrap();
    showToast("Thành công", "Xóa thẻ thành công");
  };

  const handleAssignTag = async (tagId: number, roomIds: number[]) => {
    await assignTag({ tagId, roomIds }).unwrap();
  };

  const handleCreateOrUpdateTag = async (
    tagName: string,
    color: string,
    roomIds: number[]
  ): Promise<boolean> => {
    try {
      if (editingTag) {
        // Update existing tag — duplicate check is already done by TagForm via allTags
        const updated = await handleUpdateTag(editingTag.tagId, tagName, color);
        if (updated) {
          if (roomIds.length > 0) {
            handleAssignTag(editingTag.tagId, roomIds).catch(() => {});
          }
          setEditingTag(undefined);
          return true;
        }
      } else {
        // Create new tag — duplicate check is already done by TagForm via allTags
        const created = await handleCreateTag(tagName, color);
        if (created) {
          if (roomIds.length > 0) {
            handleAssignTag(created.tagId, roomIds).catch(() => {});
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error creating/updating tag:", error);
      return false;
    }
  };

  const handleDeleteTagPress = (tag: Tag) => {
    Alert.alert(
      "Xóa phân loại",
      `Bạn có chắc chắn muốn xóa "${tag.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            await handleDeleteTag(tag.tagId);
          },
        },
      ]
    );
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagFormVisible(true);
  };

  const handleCreateNewTag = () => {
    setEditingTag(undefined);
    setTagFormVisible(true);
  };

  const handleCloseForm = () => {
    setTagFormVisible(false);
    setEditingTag(undefined);
  };

  const renderTagItem = ({ item }: { item: Tag }) => {
    if (item.systemTag) return null;

    return (
      <View style={styles.tagItem}>
        <View
          style={[
            styles.tagColorDot,
            {
              backgroundColor: item.color,
            },
          ]}
        />
        <View style={styles.tagInfo}>
          <Text style={styles.tagName}>{item.name}</Text>
        </View>
        <View style={styles.tagActions}>
          <TouchableOpacity
            onPress={() => handleEditTag(item)}
            disabled={isLoading || tagFormVisible}
            style={styles.actionButton}
          >
            <Ionicons 
              name="pencil" 
              size={18} 
              color={isLoading || tagFormVisible ? "#d1d5db" : "#3b82f6"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTagPress(item)}
            disabled={isLoading || tagFormVisible}
            style={styles.actionButton}
          >
            <Ionicons 
              name="trash" 
              size={18} 
              color={isLoading || tagFormVisible ? "#d1d5db" : "#ef4444"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filterTags = tags.filter((tag) => !tag.systemTag);

  return (
    <>
      {/* Tag Manager Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={tagFormVisible ? undefined : onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Quản lý phân loại</Text>
              <TouchableOpacity onPress={onClose} disabled={isLoading}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoadingTags ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : filterTags.length > 0 ? (
              <FlatList
                data={filterTags}
                keyExtractor={(item) => item.tagId.toString()}
                renderItem={renderTagItem}
                scrollEnabled={true}
                style={styles.listContainer}                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Chưa có phân loại nào</Text>
                <Text style={styles.emptySubtext}>
                  Nhấn "Tạo mới" để tạo phân loại đầu tiên
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateNewTag}
                disabled={isLoading || tagFormVisible}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tag Form - Inside Modal, rendered last so it's on top */}
        <TagForm
          visible={tagFormVisible}
          onClose={handleCloseForm}
          onSubmit={handleCreateOrUpdateTag}
          tag={editingTag}
          allRooms={chatRooms}
          isLoading={isLoading}
          allTags={tags}
          onSuccess={(msg) => showToast("Thành công", msg)}
        />
      </Modal>
    </>
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
    height: Dimensions.get("window").height * 0.8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 6,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  tagColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
  },
  tagActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 6,
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
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  createButton: {
    backgroundColor: "#3b82f6",
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
