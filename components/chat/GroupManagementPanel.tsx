import { useDissolveGroup } from "@/hooks/useDissolveGroup";
import { useRemoveMember } from "@/hooks/useRemoveMember";
import { useUser } from "@/hooks/useUser";
import { useGetMemberInGroupChatQuery } from "@/services/chatRoom/groupChat/groupChatApi";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GroupManagementPanelProps {
  groupName: string;
  groupId: number;
  isOwner?: boolean;
}

export const GroupManagementPanel = ({
  groupName,
  groupId,
  isOwner = false,
}: GroupManagementPanelProps) => {
  const { user } = useUser();
  const { handleDissolveGroup, handleLeaveGroup, isLoading } =
    useDissolveGroup();
  const { handleRemoveMember, isLoading: isRemoving } = useRemoveMember();
  const { data: membersData } = useGetMemberInGroupChatQuery(groupId);

  const members = membersData?.data || [];

  // Get current user's role
  const currentUserRole = members.find(
    (m) => m.accountId === user?.accountId
  )?.role;

  const canRemove = (memberRole: string) => {
    if (isOwner) return true;
    if (currentUserRole === "MODERATOR" && memberRole === "MEMBER") return true;
    return false;
  };

  const onHandleLeaveGroup = async () => {
    await handleLeaveGroup(groupId, groupName);
  };

  const handleDissolve = async () => {
    await handleDissolveGroup(groupName, groupId);
  };

  const handleRemove = async (
    member: any
  ) => {
    const success = await handleRemoveMember(
      groupId,
      member.chatMemberId.toString(),
      member.fullName
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thông tin nhóm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin nhóm</Text>
        <TouchableOpacity
          style={styles.addMemberBtn}
          onPress={() =>
            router.push({
              pathname: "/chat/add-members",
              params: {
                groupId: String(groupId),
                members: JSON.stringify(members),
              },
            })
          }
        >
          <Ionicons name="person-add-outline" size={20} />
          <Text>Thêm thành viên</Text>
        </TouchableOpacity>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Tên nhóm:</Text>
          <Text style={styles.infoValue}>{groupName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Số thành viên:</Text>
          <Text style={styles.infoValue}>{members.length}</Text>
        </View>
      </View>

      {/* Danh sách thành viên */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thành viên ({members.length})</Text>
        {members.length > 0 ? (
          <View style={styles.membersList}>
            {members.map((member, index) => {
              const isSelf = member.accountId === user?.accountId;
              const canRemoveMember =
                !isSelf && canRemove(member.role);

              return (
                <View key={member.chatMemberId} style={styles.memberItem}>
                  <Image
                    source={{
                      uri:
                        member.avatar ||
                        "https://i.pravatar.cc/150?img=1",
                    }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.fullName}</Text>
                    <View style={styles.roleContainer}>
                      <Text
                        style={[
                          styles.roleLabel,
                          member.role === "OWNER" && styles.roleOwner,
                          member.role === "MODERATOR" &&
                            styles.roleModerator,
                        ]}
                      >
                        {member.role === "OWNER"
                          ? "Chủ nhóm"
                          : member.role === "MODERATOR"
                            ? "Người điều hành"
                            : "Thành viên"}
                      </Text>
                    </View>
                  </View>
                  {canRemoveMember && (
                    <TouchableOpacity
                      onPress={() => handleRemove(member)}
                      disabled={isRemoving}
                      style={styles.removeButton}
                    >
                      {isRemoving ? (
                        <ActivityIndicator size="small" color="#FF3B30" />
                      ) : (
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>Không có thành viên</Text>
        )}
      </View>

      {/* Tùy chọn nhóm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tùy chọn</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onHandleLeaveGroup}
          disabled={isLoading}
        >
          <Feather name="log-out" size={18} color="#FF3B30" />
          <Text style={styles.actionButtonText}>Rời khỏi nhóm</Text>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDissolve}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Feather name="trash-2" size={18} color="#FF3B30" />
            )}
            <Text style={styles.dangerButtonText}>Giải tán nhóm</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  roleContainer: {
    marginTop: 4,
  },
  roleLabel: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    color: "#666",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  roleOwner: {
    backgroundColor: "#FFE5E5",
    color: "#FF3B30",
  },
  roleModerator: {
    backgroundColor: "#E5F3FF",
    color: "#007AFF",
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#FF3B30",
  },
  dangerButton: {
    backgroundColor: "#FFE5E5",
  },
  dangerButtonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 10,

    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    // shadow Android
    elevation: 2,
  },
});
