'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import useFriendActions from '@/hooks/useFriendActions';
import { useUser } from '@/hooks/useUser';
import { selectLastFriendshipRealtimeEventAt, selectPendingIncomingRequests } from '@/lib/features/friendshipSlice';
import { useAppSelector } from '@/lib/hooks';
import type { FriendRequest } from '@/services/friendship/friendshipType';
import { getFriendUserDisplayName } from '@/utils/friendshipUtils';
import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

const DEFAULT_AVATAR = '/placeholder.svg';
const DEFAULT_USER_NAME = 'Người dùng';
const INVITE_TOAST_DURATION_MS = 12000;
const EMPTY_REQUESTS: FriendRequest[] = [];

const toInviteToastId = (requestId: number): string => {
  return `friendship-invite-${requestId}`;
};

export default function FriendshipInviteToastListener() {
  const { user, isSignedIn } = useUser();
  const currentUserId = user?.accountId ?? 0;
  const skip = !isSignedIn || !user || currentUserId <= 0;

  const lastRealtimeEventAt = useAppSelector(selectLastFriendshipRealtimeEventAt);
  const incomingRequests = useAppSelector((state) =>
    currentUserId > 0 ? selectPendingIncomingRequests(state, currentUserId) : EMPTY_REQUESTS,
  );

  const { handleAcceptFriendRequest, handleRejectFriendRequest } = useFriendActions();

  const seenRequestIdsRef = useRef<Set<number>>(new Set());
  const inflightRequestIdsRef = useRef<Set<number>>(new Set());
  const lastHandledEventAtRef = useRef<string | null>(null);
  const lastAccountIdRef = useRef<number | null>(null);

  const runInviteAction = useCallback(
    async (requestId: number, toastId: string, action: 'accept' | 'reject') => {
      if (inflightRequestIdsRef.current.has(requestId)) {
        return;
      }

      inflightRequestIdsRef.current.add(requestId);

      try {
        const ok =
          action === 'accept' ? await handleAcceptFriendRequest(requestId) : await handleRejectFriendRequest(requestId);

        if (ok) {
          toast.dismiss(toastId);
        }
      } finally {
        inflightRequestIdsRef.current.delete(requestId);
      }
    },
    [handleAcceptFriendRequest, handleRejectFriendRequest],
  );

  useEffect(() => {
    if (skip) {
      seenRequestIdsRef.current.clear();
      inflightRequestIdsRef.current.clear();
      lastHandledEventAtRef.current = null;
      lastAccountIdRef.current = null;
      return;
    }

    if (lastAccountIdRef.current !== currentUserId) {
      seenRequestIdsRef.current.clear();
      inflightRequestIdsRef.current.clear();
      lastHandledEventAtRef.current = null;
      lastAccountIdRef.current = currentUserId;
    }
  }, [currentUserId, skip]);

  useEffect(() => {
    if (skip) {
      return;
    }

    if (!lastRealtimeEventAt) {
      incomingRequests.forEach((request) => {
        seenRequestIdsRef.current.add(request.requestId);
      });
      return;
    }

    if (lastHandledEventAtRef.current === lastRealtimeEventAt) {
      return;
    }

    lastHandledEventAtRef.current = lastRealtimeEventAt;

    const newIncomingRequests = incomingRequests.filter((request) => !seenRequestIdsRef.current.has(request.requestId));

    if (newIncomingRequests.length === 0) {
      return;
    }

    newIncomingRequests.forEach((request) => {
      seenRequestIdsRef.current.add(request.requestId);

      const sender = request.sender ?? request.counterpart;
      const senderDisplayName = getFriendUserDisplayName(sender, DEFAULT_USER_NAME);
      const senderAvatar = sender?.avatar || DEFAULT_AVATAR;
      const toastId = toInviteToastId(request.requestId);

      toast.custom(
        () => (
          <div className="flex w-[min(92vw,360px)] bg-white items-start gap-3 p-2 rounded-xl shadow border">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={senderAvatar} alt={senderDisplayName} />
              <AvatarFallback>{senderDisplayName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-1">
                <p className="truncate text-sm font-semibold">{senderDisplayName}</p>
                <p className="text-xs text-muted-foreground">đã gửi lời mời kết bạn</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-xl flex-1 font-medium"
                  onClick={() => {
                    void runInviteAction(request.requestId, toastId, 'accept');
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl flex-1 font-medium"
                  onClick={() => {
                    void runInviteAction(request.requestId, toastId, 'reject');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
              </div>
            </div>
          </div>
        ),
        {
          id: toastId,
          duration: INVITE_TOAST_DURATION_MS,
        },
      );
    });
  }, [currentUserId, incomingRequests, lastRealtimeEventAt, runInviteAction, skip]);

  return null;
}
