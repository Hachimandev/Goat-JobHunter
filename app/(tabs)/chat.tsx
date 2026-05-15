import { useDebounce } from "@/hooks/useDebounce";
import { useUser } from "@/hooks/useUser";
import { useAppSelector } from "@/lib/hooks";
import {
  useFetchChatRoomsQuery,
  useLazyCheckExistingChatRoomQuery,
  useSendMessageToNewChatRoomMutation,
} from "@/services/chatRoom/chatRoomApi";
import { useLazySearchUsersQuery } from "@/services/user/userApi";
import { FriendSearchItem } from "@/components/chat/FriendSearchItem";
import {
  useFetchTagsQuery,
  useFetchTagAssignmentsQuery,
} from "@/services/tag/tagApi";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useFocusEffect } from "expo-router";
import { MessageSquarePlus, ScanQrCode, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TagSelector } from "@/components/chat/TagSelector";
import { TagManager } from "@/components/chat/TagManager";
import { TagBadge } from "@/components/chat/TagBadge";
import { Tag } from "@/types/model";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function ChatListScreen() {
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagSelectorVisible, setTagSelectorVisible] = useState(false);
  const [tagManagerVisible, setTagManagerVisible] = useState(false);

  // Get unread counts from Redux
  const { unreadCounts } = useAppSelector((state) => state.chatNotification);

  // Lấy danh sách phòng chat hiện tại
  const {
    data: chatRoomsRes,
    isLoading: isLoadingRooms,
    refetch,
  } = useFetchChatRoomsQuery(
    {
      page: 1,
      size: 50,
    },
    { pollingInterval: 3000 }, // Poll every 3 seconds for faster updates
  );

  // Fetch tags
  const { data: tagsResponse, refetch: refetchTags } = useFetchTagsQuery({
    page: 1,
    size: 50,
  });

  // Fetch tag assignments
  const { data: tagAssignmentsResponse } = useFetchTagAssignmentsQuery();

  const [triggerSearch, { data: searchData, isFetching: isSearching }] =
    useLazySearchUsersQuery();
  const [checkExistingRoom] = useLazyCheckExistingChatRoomQuery();
  const [createChat, { isLoading: isCreating }] =
    useSendMessageToNewChatRoomMutation();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchTags();
    }, []),
  );

  useEffect(() => {
    if (debouncedKeyword.length >= 2) {
      triggerSearch(debouncedKeyword);
    }
  }, [debouncedKeyword, triggerSearch]);

  const handleStartChat = async (targetUser: any) => {
    if (isCreating) return; // Tránh spam click

    try {
      // 1. Kiểm tra phòng chat tồn tại
      const { data: existingRoomRes } = await checkExistingRoom(
        targetUser.accountId,
      ).unwrap();
      const existingRoom = existingRoomRes;

      if (existingRoom?.roomId) {
        setKeyword(""); // Đóng tìm kiếm
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: existingRoom.roomId,
            name: targetUser.fullName,
            avatar: targetUser.avatar, // Truyền luôn avatar qua để UI đẹp
            targetUserId: String(targetUser.accountId),
          },
        });
      } else {
        // 2. Tạo phòng chat mới nếu chưa có
        const res = await createChat({
          accountId: targetUser.accountId,
        }).unwrap();
        if (res.data) {
          setKeyword("");
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: res.data.roomId,
              name: targetUser.fullName,
              avatar: targetUser.avatar,
              targetUserId: String(targetUser.accountId),
            },
          });
        }
      }
    } catch (error) {
      console.error("Start chat error", error);
    }
  };

  const chatRooms = chatRoomsRes?.data?.result || [];
  const tags = tagsResponse?.data?.result ?? [];
  const tagAssignments = tagAssignmentsResponse?.data ?? [];

  // Create map of room IDs to tags
  const roomTagsMap = useMemo(() => {
    const tagById = new Map(tags.map((tag) => [tag.tagId, tag]));
    const map = new Map<number, Tag>();

    tagAssignments.forEach((assignment) => {
      const matchedTag = tagById.get(assignment.tagId);
      if (matchedTag) {
        map.set(assignment.roomId, matchedTag);
      } else {
        map.set(assignment.roomId, {
          tagId: assignment.tagId,
          name: assignment.tagName,
          color: assignment.tagColor,
          systemTag: assignment.systemTag,
        });
      }
    });

    return map;
  }, [tags, tagAssignments]);

  // Filter chat rooms based on selected tags
  const filteredChatRooms = useMemo(() => {
    if (selectedTagIds.length === 0) {
      return chatRooms;
    }

    return chatRooms.filter((room) => {
      const roomTag = roomTagsMap.get(room.roomId);
      if (!roomTag) return false;
      return selectedTagIds.includes(roomTag.tagId);
    });
  }, [chatRooms, selectedTagIds, roomTagsMap]);

  const searchResults =
    searchData?.data?.result.filter(
      (u: any) => u.accountId !== user?.accountId,
    ) || [];
  const isSearchingActive = keyword.length >= 2;

  const tagDisplayText = useMemo(() => {
    if (selectedTagIds.length === 0) return "";
    if (selectedTagIds.length === 1) {
      const selectedTag = tags.find((t) => t.tagId === selectedTagIds[0]);
      return selectedTag?.name || "";
    }
    return `${selectedTagIds.length} thẻ`;
  }, [selectedTagIds, tags]);

  const handleSelectTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleDeselectTag = (tagId: number) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ZALO STYLE */}
      <View style={styles.zaloHeader}>
        <Image
          source={{
            uri: (user as any)?.avatar || "https://via.placeholder.com/100",
          }}
          style={styles.myAvatar}
        />
        <View style={styles.searchContainer}>
          <Search size={18} color="#fff" style={styles.searchIcon} />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm kiếm..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword("")}>
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setTagManagerVisible(true)}
        >
          <Ionicons name="pricetags" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/chat/create-group")}
        >
          <MessageSquarePlus size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/invite/scan")}
        >
          <ScanQrCode size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TAG FILTER SECTION */}
      {!isSearchingActive && (
        <View style={styles.tagFilterSection}>
          <TouchableOpacity
            style={[
              styles.tagFilterButton,
              selectedTagIds.length > 0 && styles.tagFilterButtonActive,
            ]}
            onPress={() => setTagSelectorVisible(true)}
          >
            <Ionicons
              name="filter"
              size={18}
              color={selectedTagIds.length > 0 ? "#fff" : "#3b82f6"}
            />
            <Text
              style={[
                styles.tagFilterText,
                selectedTagIds.length > 0 && styles.tagFilterTextActive,
              ]}
            >
              {tagDisplayText || "Lọc phân loại"}
            </Text>
            {selectedTagIds.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedTagIds([])}>
                <Ionicons name="close-circle" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* BODY */}
      {isSearchingActive ? (
        <View style={styles.searchResultArea}>
          <Text style={styles.sectionTitle}>Kết quả tìm kiếm người dùng</Text>
          {isSearching || isCreating ? (
            <ActivityIndicator color="#0084FF" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `search-${item.accountId}`}
              renderItem={({ item }) => (
                <FriendSearchItem item={item} onPress={handleStartChat} />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Không thấy người dùng {keyword}
                </Text>
              }
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredChatRooms}
          keyExtractor={(item) => item.roomId.toString()}
          onRefresh={refetch}
          refreshing={isLoadingRooms}
          ListEmptyComponent={
            selectedTagIds.length > 0 ? (
              <View style={styles.emptyFilterContainer}>
                <Ionicons name="filter" size={48} color="#d1d5db" />
                <Text style={styles.emptyFilterText}>
                  Không có phòng chat với phân loại này
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const roomTag = roomTagsMap.get(item.roomId);
            return (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() =>
                  router.push({
                    pathname: "/chat/[id]",
                    params: {
                      id: item.roomId,
                      name: item.name,
                      avatar: item.avatar,
                      targetUserId: item.counterpartAccountId
                        ? String(item.counterpartAccountId)
                        : undefined,
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri: item.avatar || "https://via.placeholder.com/100",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.chatContent}>
                  <View style={styles.chatTopRow}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.chatTime}>
                      {item.lastMessageTime
                        ? dayjs(item.lastMessageTime).fromNow()
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.chatBottomRow}>
                    {/* Tag Badge */}
                    {roomTag && <TagBadge tag={roomTag} size="small" />}
                    {/* Unread Badge */}
                    {unreadCounts[item.roomId] > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {unreadCounts[item.roomId] > 99
                            ? "99+"
                            : unreadCounts[item.roomId]}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.chatMessage}>
                    {item.lastMessagePreview || "Bắt đầu trò chuyện"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Tag Selector Modal */}
      <TagSelector
        tags={tags}
        selectedTagIds={selectedTagIds}
        onSelectTag={handleSelectTag}
        onDeselectTag={handleDeselectTag}
        onClose={() => setTagSelectorVisible(false)}
        isVisible={tagSelectorVisible}
      />

      {/* Tag Manager Modal */}
      <TagManager
        visible={tagManagerVisible}
        onClose={() => setTagManagerVisible(false)}
        tags={tags}
        chatRooms={chatRooms}
        isLoadingTags={isLoadingRooms}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  zaloHeader: {
    height: 64,
    backgroundColor: "#0084FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  myAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 0 },
  headerIconBtn: { padding: 4 },

  // Tag Filter Section
  tagFilterSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tagFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    gap: 8,
  },
  tagFilterButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  tagFilterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3b82f6",
  },
  tagFilterTextActive: {
    color: "#fff",
  },

  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 0.5,
  },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  chatContent: { flex: 1, marginLeft: 14, justifyContent: "center" },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: { fontSize: 16, fontWeight: "600", color: "#000", flex: 1 },
  chatTime: { fontSize: 11, color: "#888" },
  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  chatMessage: { fontSize: 14, color: "#666", flex: 1 },

  sectionTitle: {
    padding: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    backgroundColor: "#F0F2F5",
    textTransform: "uppercase",
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchResultArea: { flex: 1, backgroundColor: "#fff" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyFilterText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  addFriendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#0084FF",
    justifyContent: "center",
    alignItems: "center",
  },
  addFriendText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
