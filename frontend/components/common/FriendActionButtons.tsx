'use client';

import useFriendActions from '@/hooks/useFriendActions';
import { useFriendshipStatus } from '@/hooks/useFriendshipStatus';
import { cn } from '@/lib/utils';
import { FriendshipUiState } from '@/services/friendship/friendshipType';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonSize } from '@/components/ui/button';
import { Check, Loader2, ShieldBan, Undo2, UserCheck, UserMinus, UserPlus, X } from 'lucide-react';
import { useMemo } from 'react';

type FriendActionButtonsProps = {
  targetUserId: number;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  title?: string;
  hideWhenFriendOrBlocked?: boolean;
  showBlockActions?: boolean;
};

export default function FriendActionButtons({
  targetUserId,
  className,
  compact = false,
  iconOnly = false,
  title = '',
  hideWhenFriendOrBlocked = false,
  showBlockActions = false,
}: Readonly<FriendActionButtonsProps>) {
  const {
    uiState,
    isSelf,
    incomingRequestId,
    outgoingRequestId,
    isBlockedByMe,
    isLoadingPair,
    canAccept,
    canReject,
    canCancel,
    canSendRequest,
    canBlock,
    canUnblock,
  } = useFriendshipStatus(targetUserId);

  const {
    handleAcceptFriendRequest,
    handleCancelFriendRequest,
    handleRejectFriendRequest,
    handleSendFriendRequest,
    handleBlockUser,
    handleUnblockUser,
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
  const shouldShowBlockActions = showBlockActions && !iconOnly;

  if (uiState === FriendshipUiState.BLOCKED) {
    if (hideWhenFriendOrBlocked) {
      return null;
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="rounded-xl">
          {isBlockedByMe && 'Bạn đã chặn người dùng này'}
        </Badge>
        {shouldShowBlockActions && isBlockedByMe && (
          <Button
            size={buttonSize}
            variant="outline"
            className="rounded-xl flex-1"
            onClick={() => handleUnblockUser(targetUserId)}
            disabled={!canUnblock || isBusy}
            title="Bỏ chặn"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4 mr-1" />}
            Bỏ chặn
          </Button>
        )}
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
        {shouldShowBlockActions && (
          <Button
            size={buttonSize}
            variant="outline"
            className="rounded-xl flex-1"
            onClick={() => handleBlockUser(targetUserId)}
            disabled={!canBlock || isBusy}
            title="Chặn người dùng"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldBan className="h-4 w-4 mr-1" />}
            {!iconOnly && 'Chặn'}
          </Button>
        )}
      </div>
    );
  }

  if (uiState === FriendshipUiState.PENDING_RECEIVED) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size={buttonSize}
          className="rounded-xl flex-1"
          onClick={() => {
            if (canAccept && incomingRequestId) {
              void handleAcceptFriendRequest(incomingRequestId);
            }
          }}
          disabled={!canAccept || isBusy}
          title="Chấp nhận"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          {!iconOnly && 'Chấp nhận'}
        </Button>

        <Button
          size={buttonSize}
          variant="outline"
          className="rounded-xl flex-1"
          onClick={() => {
            if (canReject && incomingRequestId) {
              void handleRejectFriendRequest(incomingRequestId);
            }
          }}
          disabled={!canReject || isBusy}
          title="Từ chối"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          {!iconOnly && 'Từ chối'}
        </Button>

        {shouldShowBlockActions && (
          <Button
            size={buttonSize}
            variant="outline"
            className="rounded-xl flex-1"
            onClick={() => handleBlockUser(targetUserId)}
            disabled={!canBlock || isBusy}
            title="Chặn người dùng"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldBan className="h-4 w-4 mr-1" />}
            {!iconOnly && 'Chặn'}
          </Button>
        )}
      </div>
    );
  }

  if (uiState === FriendshipUiState.PENDING_SENT) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          size={buttonSize}
          variant="outline"
          className="rounded-xl flex-1"
          onClick={() => {
            if (canCancel && outgoingRequestId) {
              void handleCancelFriendRequest(outgoingRequestId);
            }
          }}
          disabled={!canCancel || isBusy}
          title="Hủy lời mời"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4 mr-1" />}
          {!iconOnly && 'Hủy lời mời'}
        </Button>

        {shouldShowBlockActions && (
          <Button
            size={buttonSize}
            variant="outline"
            className="rounded-xl flex-1"
            onClick={() => handleBlockUser(targetUserId)}
            disabled={!canBlock || isBusy}
            title="Chặn người dùng"
          >
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldBan className="h-4 w-4 mr-1" />}
            {!iconOnly && 'Chặn'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size={buttonSize}
        variant="outline"
        className="rounded-xl flex-1"
        onClick={() => handleSendFriendRequest(targetUserId)}
        disabled={!canSendRequest || isBusy}
        title={title || 'Thêm bạn bè'}
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
        {!iconOnly && 'Thêm bạn bè'}
      </Button>

      {shouldShowBlockActions && (
        <Button
          size={buttonSize}
          variant="outline"
          className="rounded-xl flex-1"
          onClick={() => handleBlockUser(targetUserId)}
          disabled={!canBlock || isBusy}
          title="Chặn người dùng"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldBan className="h-4 w-4 mr-1" />}
          {!iconOnly && 'Chặn'}
        </Button>
      )}
    </div>
  );
}
