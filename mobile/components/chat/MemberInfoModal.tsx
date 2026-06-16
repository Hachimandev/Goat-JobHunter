import {
  ChatMemberResponse,
  ChatRole,
} from "@/services/chatRoom/groupChat/groupChatApi";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MemberInfoModalProps {
  member: ChatMemberResponse | null;
  onClose: () => void;
  onUpdateRole: (memberId: string, name: string, role: ChatRole) => void;
  onRemoveMember: (memberId: string, name: string) => void;
}

export const MemberInfoModal = forwardRef<BottomSheet, MemberInfoModalProps>(
  ({ member, onClose, onUpdateRole, onRemoveMember }, ref) => {
    const snapPoints = useMemo(() => ["55%", "70%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    if (!member) return null;

    const handleCall = () => {
      if (member.email) {
        Alert.alert(
          "Tính năng",
          `Hệ thống chưa hỗ trợ gọi điện. Email: ${member.email}`,
        );
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin liên hệ.");
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onClose={onClose}
        topInset={0}
        detached={false}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        containerStyle={{ backgroundColor: "transparent" }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Thông tin thành viên</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <Image
              source={{
                uri: member.avatar || "https://i.pravatar.cc/150?img=1",
              }}
              style={styles.avatar}
            />

            <View style={styles.infoColumn}>
              <Text style={styles.memberName} numberOfLines={1}>
                {member.fullName}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.iconActionButton}
                  onPress={handleCall}
                >
                  <Feather name="phone" size={16} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconActionButton}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.permissionsSection}>
            {member.role === "MEMBER" && (
              <TouchableOpacity
                style={styles.permItem}
                onPress={() =>
                  onUpdateRole(
                    member.chatMemberId.toString(),
                    member.fullName,
                    "MODERATOR",
                  )
                }
              >
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={22}
                  color="#333"
                  style={styles.permIcon}
                />
                <Text style={styles.permText}>Bổ nhiệm làm quản trị viên</Text>
              </TouchableOpacity>
            )}

            {member.role === "MODERATOR" && (
              <TouchableOpacity
                style={styles.permItem}
                onPress={() =>
                  onUpdateRole(
                    member.chatMemberId.toString(),
                    member.fullName,
                    "MEMBER",
                  )
                }
              >
                <MaterialCommunityIcons
                  name="shield-remove-outline"
                  size={22}
                  color="#333"
                  style={styles.permIcon}
                />
                <Text style={styles.permText}>Gỡ quyền quản trị viên</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.permItem}
              onPress={() =>
                onUpdateRole(
                  member.chatMemberId.toString(),
                  member.fullName,
                  ChatRole.OWNER,
                )
              }
            >
              <MaterialCommunityIcons
                name="crown-outline"
                size={22}
                color="#333"
                style={styles.permIcon}
              />
              <Text style={styles.permText}>Chuyển quyền chủ nhóm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.permItem, styles.removePermItem]}
              onPress={() =>
                onRemoveMember(member.chatMemberId.toString(), member.fullName)
              }
            >
              <Ionicons
                name="person-remove-outline"
                size={22}
                color="#FF3B30"
                style={styles.permIcon}
              />
              <Text style={[styles.permText, styles.removeText]}>
                Xóa khỏi nhóm
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

MemberInfoModal.displayName = "MemberInfoModal";

const styles = StyleSheet.create({
  handleIndicator: { backgroundColor: "#E0E0E0", width: 40, marginTop: 8 },
  sheetBackground: {
    borderRadius: 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  contentContainer: { paddingBottom: 30 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  closeButton: { padding: 4 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  infoColumn: { flex: 1 },
  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  iconActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },

  permissionsSection: { marginTop: 8, paddingHorizontal: 16 },
  permItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  permIcon: { marginRight: 12, width: 24, textAlign: "center" },
  permText: { fontSize: 16, color: "#333", fontWeight: "500" },

  removePermItem: { borderBottomWidth: 0 },
  removeText: { color: "#FF3B30" },
});
