import { useState } from "react";
import { useRemoveMemberFromGroupMutation } from "@/services/chatRoom/groupChat/groupChatApi";
import { Alert } from "react-native";

export const useRemoveMember = (onMemberRemoved?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [removeMember] = useRemoveMemberFromGroupMutation();

  const handleRemoveMember = async (
    chatRoomId: number,
    chatMemberId: string,
    memberName: string
  ) => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Xóa thành viên",
        `Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm?`,
        [
          {
            text: "Hủy",
            onPress: () => resolve(false),
            style: "cancel",
          },
          {
            text: "Xóa",
            onPress: async () => {
              try {
                setIsLoading(true);
                await removeMember({
                  chatroomId: chatRoomId.toString(),
                  chatMemberId,
                }).unwrap();

                // Refetch members after successful removal
                if (onMemberRemoved) {
                  onMemberRemoved();
                }

                Alert.alert("Thành công", `Đã xóa ${memberName} khỏi nhóm`);
                resolve(true);
              } catch (error) {
                console.error("Remove member error:", error);
                Alert.alert("Lỗi", "Không thể xóa thành viên. Vui lòng thử lại.");
                resolve(false);
              } finally {
                setIsLoading(false);
              }
            },
            style: "destructive",
          },
        ]
      );
    });
  };

  return {
    isLoading,
    handleRemoveMember,
  };
};
