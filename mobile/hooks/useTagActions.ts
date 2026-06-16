import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { Toast } from "react-native-toast-notifications";
import {
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useFetchTagsQuery,
  useAssignTagMutation,
  useAssignTagByRoomMutation,
  useRemoveTagMutation,
  useFetchRoomIdsByTagQuery,
  useFetchTagAssignmentsQuery,
} from "@/services/tag/tagApi";
import { Tag } from "@/types/model";

export function useTagActions() {
  // Queries
  const { data: tagsResponse, refetch: refetchTags } = useFetchTagsQuery({
    page: 1,
    size: 50,
  });
  const { data: tagAssignmentsResponse, refetch: refetchTagAssignments } =
    useFetchTagAssignmentsQuery();

  // Mutations
  const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTag }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeletingTag }] = useDeleteTagMutation();
  const [assignTag, { isLoading: isAssigningTag }] = useAssignTagMutation();
  const [assignTagByRoom, { isLoading: isAssigningTagByRoom }] =
    useAssignTagByRoomMutation();
  const [removeTag, { isLoading: isRemovingTag }] = useRemoveTagMutation();

  // Get all tags
  const tags = tagsResponse?.data?.result ?? [];

  // Get tag assignments
  const tagAssignments = tagAssignmentsResponse?.data ?? [];

  // Create new tag
  const handleCreateTag = useCallback(
    async (name: string, color: string) => {
      if (!name.trim()) {
        Alert.alert("Lỗi", "Tên thẻ không được để trống");
        return null;
      }

      // Check for duplicate tag name
      const isDuplicate = tags.some(
        (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (isDuplicate) {
        Alert.alert("Lỗi", "Tên thẻ đã tồn tại");
        return null;
      }

      try {
        const result = await createTag({ name, color }).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Tạo thẻ thành công",
        });
        return result.data;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể tạo thẻ"
        );
        return null;
      }
    },
    [createTag, tags]
  );

  // Update tag
  const handleUpdateTag = useCallback(
    async (tagId: number, name: string, color: string) => {
      if (!name.trim()) {
        Alert.alert("Lỗi", "Tên thẻ không được để trống");
        return false;
      }

      try {
        await updateTag({ tagId, name, color }).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Cập nhật thẻ thành công",
        });
        return true;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể cập nhật thẻ"
        );
        return false;
      }
    },
    [updateTag]
  );

  // Delete tag
  const handleDeleteTag = useCallback(
    async (tagId: number) => {
      try {
        await deleteTag(tagId).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Xóa thẻ thành công",
        });
        return true;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể xóa thẻ"
        );
        return false;
      }
    },
    [deleteTag]
  );

  // Assign tag to rooms
  const handleAssignTag = useCallback(
    async (tagId: number, roomIds: number[]) => {
      try {
        await assignTag({ tagId, roomIds }).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Phân loại tin nhắn thành công",
        });
        return true;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể phân loại tin nhắn"
        );
        return false;
      }
    },
    [assignTag]
  );

  // Assign tag to specific room
  const handleAssignTagToRoom = useCallback(
    async (roomId: number, tagId: number) => {
      try {
        await assignTagByRoom({ roomId, tagId }).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Phân loại tin nhắn thành công",
        });
        return true;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể phân loại tin nhắn"
        );
        return false;
      }
    },
    [assignTagByRoom]
  );

  // Remove tag from room
  const handleRemoveTag = useCallback(
    async (roomId: number) => {
      try {
        await removeTag({ roomId }).unwrap();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Xóa phân loại thành công",
        });
        return true;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.data?.message || "Không thể xóa phân loại"
        );
        return false;
      }
    },
    [removeTag]
  );

  return {
    // State
    tags,
    tagAssignments,

    // Queries
    tagsResponse,
    tagAssignmentsResponse,
    refetchTags,
    refetchTagAssignments,

    // Mutations
    handleCreateTag,
    handleUpdateTag,
    handleDeleteTag,
    handleAssignTag,
    handleAssignTagToRoom,
    handleRemoveTag,

    // Loading states
    isCreatingTag,
    isUpdatingTag,
    isDeletingTag,
    isAssigningTag,
    isAssigningTagByRoom,
    isRemovingTag,
  };
}
