import { useUser } from "@/hooks/useUser";
import { useAppDispatch } from "@/lib/hooks";
import {
  ChatRole,
  groupChatApi,
} from "@/services/chatRoom/groupChat/groupChatApi";
import { Alert } from "react-native";

export const useUpdateMemberRole = (onSuccess?: () => void) => {
  const [updateRole, { isLoading }] =
    groupChatApi.useUpdateMemberRoleMutation();
  const dispatch = useAppDispatch();
  const { user } = useUser();

  const handleUpdateRole = async (
    chatroomId: string,
    chatMemberId: string,
    newRole: ChatRole,
    memberName: string,
  ) => {
    let roleText =
      newRole === ChatRole.OWNER
        ? "Chủ nhóm"
        : newRole === ChatRole.MODERATOR
          ? "Người quản trị"
          : "Thành viên";

    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn thay đổi vai trò của ${memberName} thành ${roleText}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              await updateRole({
                chatroomId,
                chatMemberId,
                role: newRole,
              }).unwrap();

              if (newRole === ChatRole.OWNER && user?.accountId) {
                dispatch(
                  groupChatApi.util.updateQueryData(
                    "getMemberInGroupChat",
                    Number(chatroomId),
                    (draft) => {
                      if (draft && draft.data) {
                        draft.data.forEach((member) => {
                          if (member.chatMemberId.toString() === chatMemberId) {
                            member.role = ChatRole.OWNER;
                          }
                          if (member.accountId === user.accountId) {
                            member.role = ChatRole.MEMBER;
                          }
                        });
                      }
                    },
                  ),
                );
              }

              Alert.alert(
                "Thành công",
                `Bạn đã nhường quyền chủ nhóm cho ${memberName}.`,
              );
              onSuccess?.();
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chuyển quyền chủ nhóm.");
            }
          },
        },
      ],
    );
  };

  return { handleUpdateRole, isLoading };
};
