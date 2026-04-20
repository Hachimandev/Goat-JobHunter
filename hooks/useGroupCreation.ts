import { useState } from "react";
import { useCreateGroupChatMutation } from "@/services/chatRoom/groupChat/groupChatApi";
import { useUploadSingleFileMutation } from "@/services/upload/uploadApi";
import { User } from "@/types/model";
import { Alert } from "react-native";
import { router } from "expo-router";

interface CreateGroupParams {
  name: string;
  avatar: {
    uri: string;
    type: string;
    name: string;
  };
  selectedUsers: User[];
}

export const useGroupCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [createGroupChat] = useCreateGroupChatMutation();
  const [uploadFile] = useUploadSingleFileMutation();

  const createGroup = async (params: CreateGroupParams) => {
    try {
      setIsLoading(true);

      if (params.selectedUsers.length < 2) {
        Alert.alert("Lỗi", "Nhóm chat cần có ít nhất 2 thành viên");
        return false;
      }

      if (!params.name.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
        return false;
      }

      if (!params.avatar) {
        Alert.alert("Lỗi", "Vui lòng chọn ảnh đại diện cho nhóm");
        return false;
      }

      // Upload avatar first
      const uploadResult = await uploadFile({
        file: params.avatar,
        folderType: "/chatgroup/avatars",
      }).unwrap();

      if (!uploadResult.data?.url) {
        Alert.alert(
          "Lỗi",
          "Không thể tải ảnh lên. Vui lòng kiểm tra định dạng ảnh và thử lại."
        );
        return false;
      }

      // Create group with avatar URL
      const result = await createGroupChat({
        accountIds: params.selectedUsers.map((u) => u.accountId),
        name: params.name.trim(),
        avatar: uploadResult.data.url,
      }).unwrap();

      if (result.data?.roomId) {
        Alert.alert("Thành công", "Tạo nhóm chat thành công");
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: result.data.roomId,
            name: params.name.trim(),
            avatar: uploadResult.data.url,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Create group error:", error);
      Alert.alert("Lỗi", "Không thể tạo nhóm chat. Vui lòng thử lại.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createGroup,
  };
};
