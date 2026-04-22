import {
  useAddOptionsMutation,
  useClosePollMutation,
  useFetchPollByIdInChatRoomQuery,
} from "@/services/poll/pollApi";
import {
  useFetchVotesForPollQuery,
  useVotePollMutation,
} from "@/services/poll/vote/voteApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const PollVoteModal = ({
  visible,
  onClose,
  poll: initialPoll,
  currentUser,
}: any) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newOptText, setNewOptText] = useState("");

  const { data: pollData, refetch: refetchPoll } =
    useFetchPollByIdInChatRoomQuery(
      { chatRoomId: initialPoll?.chatRoomId, pollId: initialPoll?.pollId },
      { skip: !initialPoll || !visible },
    );

  const poll = pollData?.data || initialPoll;

  const [votePoll, { isLoading: isVoting }] = useVotePollMutation();
  const [addOptions, { isLoading: isAddingOptions }] = useAddOptionsMutation();
  const [closePoll, { isLoading: isClosing }] = useClosePollMutation();

  const { data: votesData } = useFetchVotesForPollQuery(
    { chatRoomId: poll?.chatRoomId, pollId: poll?.pollId },
    { skip: !poll || !visible },
  );

  useEffect(() => {
    if (poll && visible) {
      const alreadyVoted = poll.options
        .filter((o: any) => o.accountVoted)
        .map((o: any) => o.optionId);
      setSelectedIds(alreadyVoted);
    }
  }, [poll, visible]);

  const votesByOption = useMemo(() => {
    const list = votesData?.data ?? [];
    const map: Record<string, any[]> = {};
    list.forEach((v: any) => {
      const oid = v.option.optionId;
      if (!map[oid]) map[oid] = [];
      map[oid].push(v.account);
    });
    return map;
  }, [votesData]);

  const handleToggleOption = (id: string) => {
    if (poll.isClosed) return;
    if (poll.multipleChoice) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const displayData = useMemo(() => {
    if (!poll) return { options: [], total: 0 };
    let tempTotal = 0;
    const options = poll.options.map((opt: any) => {
      let voters = votesByOption[opt.optionId] || [];
      const otherVoters = voters.filter(
        (v) => v.accountId !== currentUser?.accountId,
      );
      const isUserSelecting = selectedIds.includes(opt.optionId);
      const currentVoters = [...otherVoters];
      if (isUserSelecting && currentUser) {
        currentVoters.unshift({
          accountId: currentUser.accountId,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
        });
      }
      const currentCount = currentVoters.length;
      tempTotal += currentCount;
      return { ...opt, currentCount, currentVoters };
    });
    return { options, total: tempTotal };
  }, [poll, selectedIds, votesByOption, currentUser]);

  const hasChanged = useMemo(() => {
    const originalVoted =
      poll?.options
        .filter((o: any) => o.accountVoted)
        .map((o: any) => o.optionId) || [];
    return (
      JSON.stringify(originalVoted.sort()) !==
      JSON.stringify(selectedIds.sort())
    );
  }, [poll, selectedIds]);

  const isAlreadyVoted = poll?.options.some((o: any) => o.accountVoted);

  const isCreator = useMemo(() => {
    if (!poll || !currentUser) return false;
    return (
      poll.createdBy === currentUser.email ||
      poll.createdBy === currentUser.username
    );
  }, [poll, currentUser]);

  const isPollEnded = useMemo(() => {
    if (poll?.isClosed) return true;
    if (poll?.expiresAt && new Date(poll.expiresAt) < new Date()) return true;
    return false;
  }, [poll]);

  const handleClosePoll = async () => {
    Alert.alert(
      "Đóng bình chọn",
      "Bạn có chắc chắn muốn kết thúc bình chọn này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đóng ngay",
          style: "destructive",
          onPress: async () => {
            try {
              await closePoll({
                chatRoomId: poll.chatRoomId,
                pollId: poll.pollId,
              }).unwrap();
              refetchPoll();
            } catch (e) {
              Alert.alert("Lỗi", "Không thể đóng bình chọn");
            }
          },
        },
      ],
    );
  };

  const handleAddMore = async () => {
    if (!newOptText.trim()) return;
    try {
      await addOptions({
        chatRoomId: poll.chatRoomId,
        pollId: poll.pollId,
        texts: [newOptText.trim()],
      }).unwrap();
      setNewOptText("");
      setIsAdding(false);
      refetchPoll();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể thêm lựa chọn");
    }
  };

  const onConfirmVote = async () => {
    try {
      await votePoll({
        chatRoomId: poll.chatRoomId,
        pollId: poll.pollId,
        optionIds: selectedIds,
      }).unwrap();
      onClose();
    } catch (e) {
      Alert.alert("Lỗi", "Bình chọn thất bại");
    }
  };

  if (!poll) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.vContent}>
          <View style={styles.vHeader}>
            <Text style={styles.vTitle}>
              Bình chọn {isPollEnded ? "(Đã kết thúc)" : ""}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16, maxHeight: 500 }}>
            <Text style={styles.vQuestion}>{poll.question}</Text>
            {displayData.options.map((opt: any) => {
              const percent =
                displayData.total > 0
                  ? (opt.currentCount / displayData.total) * 100
                  : 0;
              const isSelected = selectedIds.includes(opt.optionId);
              const displayedAvatars = opt.currentVoters.slice(0, 3);
              const remainingCount =
                opt.currentVoters.length - displayedAvatars.length;

              return (
                <TouchableOpacity
                  key={opt.optionId}
                  style={styles.vOptRow}
                  onPress={() => handleToggleOption(opt.optionId)}
                  disabled={isPollEnded}
                >
                  <Ionicons
                    name={
                      isSelected
                        ? poll.multipleChoice
                          ? "checkbox"
                          : "radio-button-on"
                        : poll.multipleChoice
                          ? "square-outline"
                          : "radio-button-off"
                    }
                    size={24}
                    color={isPollEnded ? "#ccc" : "#0084FF"}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${percent}%` }]} />
                      <View style={styles.contentRow}>
                        <Text
                          style={[
                            styles.vOptText,
                            percent > 0 && { color: "#000" },
                          ]}
                        >
                          {opt.text}
                        </Text>
                        <View style={styles.avatarStack}>
                          {displayedAvatars.map((voter: any, idx: number) => (
                            <Image
                              key={voter.accountId}
                              source={{
                                uri:
                                  voter.avatar ||
                                  "https://via.placeholder.com/20",
                              }}
                              style={[
                                styles.smallAvatar,
                                {
                                  marginLeft: idx === 0 ? 0 : -8,
                                  zIndex: 10 - idx,
                                },
                              ]}
                            />
                          ))}
                          {remainingCount > 0 && (
                            <View
                              style={[
                                styles.moreAvatar,
                                { marginLeft: -8, zIndex: 0 },
                              ]}
                            >
                              <Text style={styles.moreAvatarText}>
                                +{remainingCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.vCountText}>
                      {opt.currentCount} bình chọn
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {poll.allowAddOption &&
              !isPollEnded &&
              (isAdding ? (
                <View style={styles.vAddArea}>
                  <TextInput
                    style={styles.vMiniInput}
                    value={newOptText}
                    onChangeText={setNewOptText}
                    autoFocus
                    placeholder="Nhập lựa chọn mới..."
                  />
                  <TouchableOpacity
                    onPress={handleAddMore}
                    disabled={isAddingOptions}
                  >
                    {isAddingOptions ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Text style={styles.addActionText}>Thêm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addBtnTrigger}
                  onPress={() => setIsAdding(true)}
                >
                  <Ionicons name="add" size={20} color="#0084FF" />
                  <Text style={styles.addBtnText}>Thêm lựa chọn khác</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <View style={styles.vFooter}>
            {isCreator && !isPollEnded && (
              <TouchableOpacity
                style={styles.btnClosePoll}
                onPress={handleClosePoll}
                disabled={isClosing}
              >
                {isClosing ? (
                  <ActivityIndicator size="small" color="red" />
                ) : (
                  <Text style={{ color: "#ff3b30", fontWeight: "600" }}>
                    Đóng
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {!isPollEnded ? (
              <TouchableOpacity
                style={[
                  styles.vSubmitBtn,
                  !hasChanged && { backgroundColor: "#A5D1FF" },
                ]}
                onPress={onConfirmVote}
                disabled={!hasChanged || isVoting}
              >
                {isVoting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.vSubmitTxt}>
                    {isAlreadyVoted ? "Đổi bình chọn" : "Bình chọn"}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.vSubmitBtn, { backgroundColor: "#8E8E93" }]}
                onPress={onClose}
              >
                <Text style={styles.vSubmitTxt}>Bình chọn đã kết thúc</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  vContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  vHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    alignItems: "center",
  },
  vTitle: { fontWeight: "bold", fontSize: 16 },
  vQuestion: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  vOptRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  track: {
    height: 42,
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: "#E1F0FF" },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  vOptText: { fontSize: 15, color: "#1c1c1e", flex: 1 },
  avatarStack: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  smallAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  moreAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  moreAvatarText: { fontSize: 8, color: "#fff", fontWeight: "bold" },
  vCountText: { fontSize: 12, color: "#8e8e93", marginTop: 4, marginLeft: 2 },
  vAddArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  vMiniInput: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderColor: "#0084FF",
    padding: 8,
    fontSize: 15,
  },
  addActionText: { color: "#0084FF", fontWeight: "700" },
  addBtnTrigger: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 5,
  },
  addBtnText: { color: "#0084FF", fontWeight: "600", fontSize: 15 },
  vFooter: {
    padding: 16,
    borderTopWidth: 0.5,
    borderColor: "#eee",
    flexDirection: "row",
    gap: 10,
  },
  vSubmitBtn: {
    backgroundColor: "#0084FF",
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  vSubmitTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnClosePoll: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff3b30",
    justifyContent: "center",
  },
});
