import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGroupUserSearch } from "@/hooks/useGroupUserSearch";
import { User } from "@/types/model";

export const CreateGroupMembersScreen = () => {
  const {
    keyword,
    setKeyword,
    users,
    isLoading,
    selectedUsers,
    toggleUserSelection,
    removeUser,
    shouldShowResults,
  } = useGroupUserSearch();

  const handleNext = () => {
    if (selectedUsers.length < 2) {
      alert("Vui lòng chọn ít nhất 2 thành viên");
      return;
    }

    router.push({
      pathname: "/chat/create-group-info",
      params: {
        selectedUsers: JSON.stringify(selectedUsers),
      },
    });
  };

  const renderSelectedUser = (user: User) => (
    <View key={user.accountId} style={styles.selectedUserTag}>
      <Image
        source={{
          uri: user.avatar || "https://i.pravatar.cc/150?img=1",
        }}
        style={styles.tagAvatar}
      />
      <Text style={styles.tagName} numberOfLines={1}>
        {user.fullName}
      </Text>
      <TouchableOpacity
        onPress={() => removeUser(user.accountId)}
        style={styles.tagRemove}
      >
        <Feather name="x" size={14} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(
      (u) => u.accountId === item.accountId
    );

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item)}
      >
        <Image
          source={{
            uri: item.avatar || "https://i.pravatar.cc/150?img=1",
          }}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn thành viên</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thành viên..."
          placeholderTextColor="#999"
          value={keyword}
          onChangeText={setKeyword}
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>
            Đã chọn ({selectedUsers.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedList}
          >
            {selectedUsers.map(renderSelectedUser)}
          </ScrollView>
        </View>
      )}

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {!shouldShowResults ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color="#ddd" />
            <Text style={styles.emptyText}>
              Nhập ít nhất 2 ký tự để tìm kiếm
            </Text>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color="#ddd" />
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.accountId.toString()}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedUsers.length < 2 && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedUsers.length < 2}
        >
          <Text style={styles.nextButtonText}>
            Tiếp theo ({selectedUsers.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  selectedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  selectedList: {
    flexDirection: "row",
  },
  selectedUserTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  tagName: {
    fontSize: 12,
    color: "#000",
    maxWidth: 60,
  },
  tagRemove: {
    marginLeft: 4,
    padding: 2,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  userEmail: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#ddd",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
