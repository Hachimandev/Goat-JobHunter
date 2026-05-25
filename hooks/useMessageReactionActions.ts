import { useAddReactionMutation, useRemoveReactionMutation } from '../services/chatRoom/reaction/messageReactionApi';
import { Alert } from 'react-native';

export function useMessageReactionActions(chatRoomId: number) {
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction({ chatRoomId, messageId, emoji }).unwrap();
    } catch (e: unknown) {
      Alert.alert('Error', (e as { data?: { message?: string } })?.data?.message || 'Failed');
    }
  };

  const handleRemove = async (messageId: string, emoji: string) => {
    try {
      await removeReaction({ chatRoomId, messageId, emoji }).unwrap();
    } catch (e: unknown) {
      Alert.alert('Error', (e as { data?: { message?: string } })?.data?.message || 'Failed');
    }
  };

  return { handleReaction, handleRemove };
}
