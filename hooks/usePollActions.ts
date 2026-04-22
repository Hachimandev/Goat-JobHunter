import {
  useAddOptionsMutation,
  useClosePollMutation,
  useCreatePollMutation,
} from "@/services/poll/pollApi";
import { useVotePollMutation } from "@/services/poll/vote/voteApi";
import { Alert } from "react-native";

export const usePollActions = () => {
  const [createPoll, { isLoading: isCreating }] = useCreatePollMutation();
  const [votePoll, { isLoading: isVoting }] = useVotePollMutation();
  const [addOptions, { isLoading: isAddingOptions }] = useAddOptionsMutation();
  const [closePoll, { isLoading: isClosing }] = useClosePollMutation();

  const handleCreatePoll = async (payload: any, onSuccess: () => void) => {
    try {
      await createPoll(payload).unwrap();
      Alert.alert("Thành công", "Đã tạo bình chọn mới.");
      onSuccess();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.data?.message || "Không thể tạo bình chọn");
    }
  };

  const handleVote = async (
    chatRoomId: number,
    pollId: string,
    optionIds: string[],
    onSuccess: () => void,
  ) => {
    try {
      await votePoll({ chatRoomId, pollId, optionIds }).unwrap();
      onSuccess();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.data?.message || "Bình chọn thất bại");
    }
  };

  return {
    handleCreatePoll,
    handleVote,
    isCreating,
    isVoting,
    addOptions,
    closePoll,
    isAddingOptions,
    isClosing,
  };
};
