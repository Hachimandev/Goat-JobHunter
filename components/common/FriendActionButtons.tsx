'use client';

import useFriendActions from '@/hooks/useFriendActions';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import { cn } from '@/lib/utils';
import { FriendshipUiState } from '@/services/friendship/friendshipType';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonSize } from '@/components/ui/button';
import { Check, Loader2, UserCheck, UserPlus, X } from 'lucide-react';
import { useMemo } from 'react';

type FriendActionButtonsProps = {
  targetUserId: number;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  title?: string;
  hideWhenFriendOrBlocked?: boolean;
};

export default function FriendActionButtons({
  targetUserId,
  className,
  compact = false,
  iconOnly = false,
  title = '',
  hideWhenFriendOrBlocked = false,
}: Readonly<FriendActionButtonsProps>) {
  const { uiState, isSelf, incomingRequestId, outgoingRequestId, isBlockedByMe, isBlockedByOther, isLoadingPair } =
    useFriendshipStatus(targetUserId);

  const {
    handleAcceptFriendRequest,
    handleCancelFriendRequest,
    handleRejectFriendRequest,
    handleSendFriendRequest,
    isMutating,
  } = useFriendActions();

  const buttonSize: ButtonSize = useMemo(() => {
    if (iconOnly && compact) return 'icon-sm';
    if (iconOnly) return 'icon';
    if (compact) return 'sm';
    return 'default';
  }, [iconOnly, compact]);

  if (!targetUserId || isSelf) {
    return null;
  }

  const isBusy = isLoadingPair || isMutating;

  if (uiState === FriendshipUiState.BLOCKED) {
    if (hideWhenFriendOrBlocked) {
      return null;
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="rounded-xl">
          {isBlockedByMe ? 'Bạn đã chặn' : isBlockedByOther ? 'Bạn bị chặn' : 'Đang bị chặn'}
        </Badge>
      </div>
    );
  }

  if (uiState === FriendshipUiState.FRIEND) {
    if (hideWhenFriendOrBlocked) {
      return null;
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="rounded-xl">
          <UserCheck className="h-3.5 w-3.5 mr-1" />
          Bạn bè
        </Badge>
      </div>
    );
  }

  if (uiState === FriendshipUiState.PENDING_RECEIVED) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size={buttonSize}
          className="rounded-xl"
          onClick={() => incomingRequestId && handleAcceptFriendRequest(incomingRequestId)}
          disabled={!incomingRequestId || isBusy}
          title="Chấp nhận"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          Chấp nhận
        </Button>

        <Button
          size={buttonSize}
          variant="outline"
          className="rounded-xl"
          onClick={() => incomingRequestId && handleRejectFriendRequest(incomingRequestId)}
          disabled={!incomingRequestId || isBusy}
          title="Từ chối"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          Từ chối
        </Button>
      </div>
    );
  }

  if (uiState === FriendshipUiState.PENDING_SENT) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size={buttonSize}
          variant="outline"
          className="rounded-xl"
          onClick={() => outgoingRequestId && handleCancelFriendRequest(outgoingRequestId)}
          disabled={!outgoingRequestId || isBusy}
          title="Hủy lời mời"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Hủy lời mời
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size={buttonSize}
        variant="outline"
        className="rounded-xl"
        onClick={() => handleSendFriendRequest(targetUserId)}
        disabled={isBusy}
        title={title || 'Thêm bạn bè'}
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
        {!iconOnly && 'Thêm bạn bè'}
      </Button>
    </div>
  );
}
