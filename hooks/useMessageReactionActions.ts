import { useAddReactionMutation, useRemoveReactionMutation } from "@/services/chatRoom/reaction/messageReactionApi";
import { toast } from "sonner";

export function useMessageReactionActions(chatRoomId: number) {
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction({ chatRoomId, messageId, emoji }).unwrap();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to add reaction");
    }
  };

  const handleRemove = async (messageId: string, emoji: string) => {
    try {
      await removeReaction({ chatRoomId, messageId, emoji }).unwrap();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to remove reaction");
    }
  };

  return { handleReaction, handleRemove };
}
