import { FriendRequest } from '@/services/friendship/friendshipType';
import { getFriendUserDisplayName } from '@/utils/friendshipUtils';

export type FriendRequestCardViewModel = {
  requestId: number;
  targetId: number;
  displayName: string;
  avatar: string;
};

export const toFriendRequestCardViewModel = (request: FriendRequest, incoming: boolean): FriendRequestCardViewModel => {
  const summary = request.counterpart ?? (incoming ? request.sender : request.receiver);
  const fallbackTargetId = incoming ? request.senderId : request.receiverId;

  return {
    requestId: request.requestId,
    targetId: summary?.accountId ?? fallbackTargetId,
    displayName: getFriendUserDisplayName(summary, 'Người dùng'),
    avatar: summary?.avatar || '/placeholder.svg',
  };
};
