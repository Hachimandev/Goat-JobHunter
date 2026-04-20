import { useState } from "react";
import {
  useDissolveGroupChatMutation,
  useLeaveGroupChatMutation,
} from "@/services/chatRoom/groupChat/groupChatApi";
import { Alert } from "react-native";
import { router } from "expo-router";

export const useDissolveGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dissolveGroup] = useDissolveGroupChatMutation();
  const [leaveGroup] = useLeaveGroupChatMutation();

  const handleDissolveGroup = async (groupName: string, groupId: number) => {
    return new Promise<boolean>((resolve) => {
      Alert.prompt(
        "Xác nhận giải tán nhóm",
        `Nhập tên nhóm "${groupName}" để xác nhận giải tán nhóm này`,
        [
          {
            text: "Hủy",
            onPress: () => resolve(false),
            style: "cancel",
          },
          {
            text: "Giải tán",
            onPress: async (input) => {
              if (!input || input.trim() !== groupName) {
                Alert.alert("Lỗi", "Tên nhóm không trùng khớp");
                resolve(false);
                return;
              }

              try {
                setIsLoading(true);
                await dissolveGroup({
                  chatRoomId: groupId,
                  groupNameConfirmation: input.trim(),
                }).unwrap();

                Alert.alert("Thành công", "Nhóm đã được giải tán");
                router.push("/chat");
                resolve(true);
              } catch (error) {
                console.error("Dissolve group error:", error);
                Alert.alert("Lỗi", "Không thể giải tán nhóm. Vui lòng thử lại.");
                resolve(false);
              } finally {
                setIsLoading(false);
              }
            },
            style: "destructive",
          },
        ],
        "plain-text",
        groupName
      );
    });
  };

  const handleLeaveGroup = async (groupId: number, groupName: string) => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        "Rời khỏi nhóm",
        `Bạn có chắc chắn muốn rời khỏi nhóm "${groupName}"?`,
        [
          {
            text: "Hủy",
            onPress: () => resolve(false),
            style: "cancel",
          },
          {
            text: "Rời khỏi",
            onPress: async () => {
              try {
                setIsLoading(true);
                await leaveGroup(groupId.toString()).unwrap();

                Alert.alert("Thành công", "Bạn đã rời khỏi nhóm");
                router.push("/chat");
                resolve(true);
              } catch (error) {
                console.error("Leave group error:", error);
                Alert.alert("Lỗi", "Không thể rời khỏi nhóm. Vui lòng thử lại.");
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
    handleDissolveGroup,
    handleLeaveGroup,
  };
};
