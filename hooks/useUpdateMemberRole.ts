import { useUser } from "@/hooks/useUser"; // Để lấy accountId của chính bạn
import { useAppDispatch } from "@/lib/hooks"; // Hook dispatch của bạn
import { groupChatApi } from "@/services/chatRoom/groupChat/groupChatApi";
import { Alert } from "react-native";

export const useUpdateMemberRole = (onSuccess?: () => void) => {
  const [updateRole, { isLoading }] =
    groupChatApi.useUpdateMemberRoleMutation();
  const dispatch = useAppDispatch();
  const { user } = useUser(); // Lấy thông tin user hiện tại đang đăng nhập

  const handleUpdateRole = async (
    chatroomId: string,
    chatMemberId: string,
    newRole: "OWNER" | "MODERATOR" | "MEMBER",
    memberName: string,
  ) => {
    let roleText =
      newRole === "OWNER"
        ? "Chủ nhóm"
        : newRole === "MODERATOR"
          ? "Người điều hành"
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
              // 1. Gọi API cập nhật role cho người mới
              await updateRole({
                chatroomId,
                chatMemberId,
                role: newRole,
              }).unwrap();

              // 2. NẾU LÀ CHUYỂN QUYỀN CHỦ NHÓM -> ÉP CẬP NHẬT CACHE TẠI CHỖ
              if (newRole === "OWNER" && user?.accountId) {
                dispatch(
                  groupChatApi.util.updateQueryData(
                    "getMemberInGroupChat",
                    Number(chatroomId),
                    (draft) => {
                      // draft.data là danh sách thành viên trong cache
                      if (draft && draft.data) {
                        draft.data.forEach((member) => {
                          // Người được chọn -> Lên làm OWNER
                          if (member.chatMemberId.toString() === chatMemberId) {
                            member.role = "OWNER";
                          }
                          // Chính mình (Chủ cũ) -> Xuống làm MEMBER
                          if (member.accountId === user.accountId) {
                            member.role = "MEMBER";
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
