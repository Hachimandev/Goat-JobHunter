import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEditGroup } from "@/hooks/useEditGroup";
import {
  ChatRole,
  GroupPermissionsResponse,
  useGetGroupPermissionsQuery,
  useUpdateGroupPermissionsMutation,
} from "@/services/chatRoom/groupChat/groupChatApi";
import { ChatRoomPrivacy } from "@/types/enum";

const PRIVACY_OPTIONS: {
  label: string;
  value: ChatRoomPrivacy;
  icon: string;
  description: string;
}[] = [
  {
    label: "Công khai",
    value: ChatRoomPrivacy.PUBLIC,
    icon: "earth",
    description: "Mọi người đều có thể tìm thấy và tham gia nhóm",
  },
  {
    label: "Riêng tư",
    value: ChatRoomPrivacy.PRIVATE,
    icon: "lock",
    description: "Chỉ thành viên được mời mới có thể tham gia",
  },
];

interface GroupSettingPanelProps {
  groupId: number;
  groupName: string;
  groupAvatar: string;
  currentPrivacy?: ChatRoomPrivacy;
  currentRole?: ChatRole;
  currentPermissions?: GroupPermissionsResponse;
  onRefetch?: () => void;
}

const DEFAULT_GROUP_PERMISSIONS: GroupPermissionsResponse = {
  allowMemberUpdate: true,
  allowMemberPin: true,
  allowMemberCreateVote: true,
  allowMemberSendMessage: true,
  allowModeratorSendMessage: true,
};

const PERMISSION_OPTIONS: {
  key: keyof GroupPermissionsResponse;
  label: string;
  roles: ChatRole[]; // Roles that can edit this permission
}[] = [
  {
    key: "allowMemberUpdate",
    label: "Thành viên đổi tên và ảnh nhóm",
    roles: [ChatRole.OWNER, ChatRole.MODERATOR],
  },
  {
    key: "allowMemberPin",
    label: "Thành viên ghim tin nhắn, ghi chú, bình chọn",
    roles: [ChatRole.OWNER, ChatRole.MODERATOR],
  },
  {
    key: "allowMemberCreateVote",
    label: "Thành viên tạo bình chọn",
    roles: [ChatRole.OWNER, ChatRole.MODERATOR],
  },
  {
    key: "allowMemberSendMessage",
    label: "Thành viên gửi tin nhắn",
    roles: [ChatRole.OWNER, ChatRole.MODERATOR],
  },
  {
    key: "allowModeratorSendMessage",
    label: "Quản trị viên gửi tin nhắn",
    roles: [ChatRole.OWNER],
  },
];

export const GroupSettingPanel = ({
  groupId,
  currentPrivacy = ChatRoomPrivacy.PUBLIC,
  currentRole,
  currentPermissions,
  onRefetch,
}: GroupSettingPanelProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isLoading, handleEditGroup } = useEditGroup();
  const [updateGroupPermissions, { isLoading: isUpdatingPermissions }] =
    useUpdateGroupPermissionsMutation();

  const canViewPermissionSection =
    currentRole === ChatRole.OWNER || currentRole === ChatRole.MODERATOR;

  const { data: groupPermissionsData } = useGetGroupPermissionsQuery(groupId, {
    skip: !canViewPermissionSection,
  });

  const [permissions, setPermissions] = useState<GroupPermissionsResponse>(
    currentPermissions || DEFAULT_GROUP_PERMISSIONS,
  );

  const resolvedPermissionResponse = useMemo(() => {
    if (
      groupPermissionsData &&
      "data" in groupPermissionsData &&
      groupPermissionsData.data
    ) {
      return groupPermissionsData.data;
    }

    return (
      (groupPermissionsData as GroupPermissionsResponse | undefined) || null
    );
  }, [groupPermissionsData]);

  useEffect(() => {
    if (resolvedPermissionResponse) {
      setPermissions({
        ...DEFAULT_GROUP_PERMISSIONS,
        ...resolvedPermissionResponse,
      });
      return;
    }

    if (currentPermissions) {
      setPermissions({
        ...DEFAULT_GROUP_PERMISSIONS,
        ...currentPermissions,
      });
    }
  }, [currentPermissions, resolvedPermissionResponse]);

  const selectedOption = PRIVACY_OPTIONS.find(
    (o) => o.value === currentPrivacy,
  );

  const canEditPermission = (key: keyof GroupPermissionsResponse) => {
    if (currentRole === ChatRole.OWNER) {
      return true;
    }

    if (currentRole === ChatRole.MODERATOR) {
      return key !== "allowModeratorSendMessage";
    }

    return false;
  };

  const handlePrivacyChange = async (value: ChatRoomPrivacy) => {
    const success = await handleEditGroup({
      groupId,
      currentPrivacy,
      newPrivacy: value,
    });

    if (success) {
      if (onRefetch) {
        onRefetch();
      }
      setModalVisible(false);
    }
  };

  const handlePermissionChange = async (
    key: keyof GroupPermissionsResponse,
    value: boolean,
  ) => {
    if (!canEditPermission(key) || isUpdatingPermissions) {
      return;
    }

    const previousPermissions = permissions;
    const nextPermissions = {
      ...permissions,
      [key]: value,
    };

    setPermissions(nextPermissions);

    try {
      const response = await updateGroupPermissions({
        chatRoomId: groupId,
        ...nextPermissions,
      }).unwrap();

      const serverPermissions = response?.data;

      setPermissions({
        ...DEFAULT_GROUP_PERMISSIONS,
        ...serverPermissions,
      });

      if (onRefetch) {
        onRefetch();
      }
    } catch (error: any) {
      setPermissions(previousPermissions);
      Alert.alert(
        "Lỗi",
        error?.data?.message ||
          "Không thể cập nhật quyền nhóm. Vui lòng thử lại.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quyền riêng tư nhóm</Text>

      <TouchableOpacity
        style={[
          styles.selectTrigger,
          isLoading && styles.selectTriggerDisabled,
        ]}
        onPress={() => !isLoading && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <View style={styles.selectLeft}>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#0084FF"
              style={styles.icon}
            />
          ) : (
            <MaterialCommunityIcons
              name={selectedOption?.icon as any}
              size={18}
              color="#0084FF"
              style={styles.icon}
            />
          )}
          <Text style={styles.selectValue}>{selectedOption?.label}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn quyền riêng tư</Text>
            {PRIVACY_OPTIONS.map((option, index) => {
              const isSelected = option.value === currentPrivacy;
              const isLast = index === PRIVACY_OPTIONS.length - 1;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    !isLast && styles.optionItemBorder,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => handlePrivacyChange(option.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionIconWrap,
                      isSelected && styles.optionIconWrapSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={20}
                      color={isSelected ? "#fff" : "#666"}
                    />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#0084FF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {canViewPermissionSection && (
        <View style={styles.permissionSection}>
          <Text style={styles.label}>Quyền trong nhóm</Text>
          <View style={styles.permissionCard}>
            {PERMISSION_OPTIONS.filter((option) =>
              option.roles.includes(currentRole),
            ).map((option, index) => {
              const isLast = index === PERMISSION_OPTIONS.length - 1;

              return (
                <View
                  key={option.key}
                  style={[
                    styles.permissionRow,
                    !isLast && styles.permissionRowBorder,
                  ]}
                >
                  <Text style={[styles.permissionLabel]}>{option.label}</Text>
                  <Switch
                    value={permissions[option.key]}
                    onValueChange={(nextValue) =>
                      handlePermissionChange(option.key, nextValue)
                    }
                    disabled={isUpdatingPermissions}
                    trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#fff",
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    // Android
    elevation: 1,
  },
  selectTriggerDisabled: {
    opacity: 0.6,
  },
  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  selectValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 8,
    overflow: "hidden",
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    // Android
    elevation: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  optionItemSelected: {
    backgroundColor: "#F0F8FF",
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionIconWrapSelected: {
    backgroundColor: "#0084FF",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: "#0084FF",
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 11,
    color: "#8E8E93",
  },
  permissionSection: {
    marginTop: 16,
  },
  permissionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  permissionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  permissionLabel: {
    flex: 1,
    fontSize: 13,
    color: "#000",
    fontWeight: "500",
  },
  permissionLabelReadOnly: {
    color: "#8E8E93",
  },
});
