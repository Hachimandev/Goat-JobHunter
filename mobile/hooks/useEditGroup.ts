import { useState } from "react";
import { useUpdateGroupInfoMutation } from "@/services/chatRoom/groupChat/groupChatApi";
import { useUploadSingleFileMutation } from "@/services/upload/uploadApi";
import { Alert } from "react-native";
import { ChatRoomPrivacy } from "@/types/enum";

interface EditGroupParams {
  groupId: number;
  groupName?: string;
  currentPrivacy?: ChatRoomPrivacy;
  newGroupName?: string;
  avatarAsset?: any;
  newPrivacy?: ChatRoomPrivacy;
}

export const useEditGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updateGroupInfo] = useUpdateGroupInfoMutation();
  const [uploadFile] = useUploadSingleFileMutation();

  const handleEditGroup = async ({
    groupId,
    groupName,
    avatarAsset,
    newGroupName,
    currentPrivacy,
    newPrivacy,
  }: EditGroupParams) => {
    try {
      setIsLoading(true);

      if (newGroupName && !newGroupName.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
        return false;
      }

      const updateData: {
        name?: string;
        avatar?: string;
        privacy?: ChatRoomPrivacy;
      } = {};

      // Only add name if it changed
      if (newGroupName && newGroupName.trim() !== groupName) {
        updateData.name = newGroupName.trim();
      }

      if (newPrivacy && newPrivacy !== currentPrivacy) {
        updateData.privacy = newPrivacy;
      }

      // Upload avatar if selected
      if (avatarAsset) {
        try {
          const uploadResult = await uploadFile({
            file: avatarAsset as any,
            folderType: "/chatgroup/avatars",
          }).unwrap();

          if (uploadResult.data?.url) {
            updateData.avatar = uploadResult.data.url;
          } else {
            Alert.alert("Lỗi", "Không thể tải ảnh lên");
            return false;
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Lỗi", "Lỗi khi tải ảnh lên. Vui lòng thử lại");
          return false;
        }
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        Alert.alert("Thông báo", "Không có thay đổi nào");
        return false;
      }

      // Update group info
      await updateGroupInfo({
        chatroomId: groupId.toString(),
        ...updateData,
      }).unwrap();

      Alert.alert("Thành công", "Cập nhật thông tin nhóm thành công");
      return true;
    } catch (error) {
      console.error("Edit group error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin nhóm");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleEditGroup,
  };
};
