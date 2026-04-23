'use client';

import { ChatWindow } from '@/app/(chat)/messages/components/ChatWindow';
import { ForwardMessageModal } from '@/app/(chat)/messages/components/ForwardMessageModal';
import { usePaginatedChatMessages } from '@/app/(chat)/messages/hooks/usePaginatedChatMessages';
import { useParams } from 'next/navigation';
import { useFetchChatRoomsByIdQuery } from '@/services/chatRoom/chatRoomApi';
import { useGetCurrentCallQuery } from '@/services/chatRoom/call/callApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import useChatRoomAndMessageActions from '@/hooks/useChatRoomAndMessageActions';
import { CallSession, MessageResponse, PinnedMessage } from '@/types/model';
import { CallStatusEnum, CallTypeEnum, ChatRoomType } from '@/types/enum';
import { subscribeToChatRoom } from '@/services/chatRoom/message/messageApi';
import { useAppSelector } from '@/lib/hooks';
import { selectLastFriendshipRealtimeEventAt } from '@/lib/features/friendshipSlice';
import { selectLastCallRealtimeEvent, selectLastCallRealtimeEventAt } from '@/lib/features/callSlice';
import {
  usePinMessageMutation,
  useUnpinMessageMutation,
  useGetPinnedMessagesQuery,
} from '@/services/chatRoom/pinned_message/pinnedMessageApi';
import { toast } from 'sonner';
import { IBackendError } from '@/types/api';
import { Loader2 } from 'lucide-react';
import useCallRoomActions from '@/hooks/useCallRoomActions';
import { CallWindow } from '@/app/(chat)/messages/components/CallWindow';

export default function ChatRoomPage() {
  const params = useParams();
  const chatRoomId = params?.id as string;
  const parsedChatRoomId = Number(chatRoomId);
  const isInvalidChatRoomId = !chatRoomId || Number.isNaN(parsedChatRoomId);
  const { user } = useUser();
  const lastFriendshipRealtimeEventAt = useAppSelector(selectLastFriendshipRealtimeEventAt);
  const lastCallRealtimeEvent = useAppSelector(selectLastCallRealtimeEvent);
  const lastCallRealtimeEventAt = useAppSelector(selectLastCallRealtimeEventAt);
  const [forwardMessage, setForwardMessage] = useState<MessageResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState<MessageResponse | null>(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [pinningMessageIds, setPinningMessageIds] = useState<Set<string>>(new Set());
  const [isJoiningOngoingCall, setIsJoiningOngoingCall] = useState(false);

  const {
    handleSendMessage,
    handleSendContactCards,
    handleDeleteMessage,
    handleForwardMessage,
    handleHideMessage,
    handleRecallMessage,
    isDeletingMessage,
    isForwardingMessage,
    isHidingMessage,
    isRecallingMessage,
  } = useChatRoomAndMessageActions();

  const [pinMessage] = usePinMessageMutation();
  const [unpinMessage] = useUnpinMessageMutation();
  const {
    currentCall,
    callError,
    rtcConnectionState,
    localAudioEnabled,
    localVideoEnabled,
    participantMediaStates,
    remoteAudioActive,
    remoteVideoActive,
    isLeavingCall,
    isEndingCall,
    availableCallDevices,
    selectedCallDevices,
    isLoadingCallDevices,
    updatingCallDeviceKind,
    handleStartCall,
    handleEndCall,
    handleLeaveCall,
    handleJoinCallSession,
    handleSelectCallDevice,
    handleToggleLocalAudio,
    handleToggleLocalVideo,
    bindRtcContainers,
    bindParticipantVideoContainer,
  } = useCallRoomActions();
  const { data: pinnedMessagesData, isLoading: isLoadingPinnedMessages } = useGetPinnedMessagesQuery(
    { chatRoomId: parsedChatRoomId },
    { skip: isInvalidChatRoomId },
  );

  const { messages, hasOlderMessages, isLoadingInitialMessages, isLoadingOlderMessages, loadOlderMessages } =
    usePaginatedChatMessages(isInvalidChatRoomId ? null : parsedChatRoomId);

  const {
    data: chatRoomsData,
    refetch: refetchChatRoom,
    isLoading: isLoadingChatRoom,
  } = useFetchChatRoomsByIdQuery(parsedChatRoomId, {
    skip: isInvalidChatRoomId,
  });

  useEffect(() => {
    if (isInvalidChatRoomId) {
      return;
    }

    subscribeToChatRoom(parsedChatRoomId);
  }, [isInvalidChatRoomId, parsedChatRoomId]);

  useEffect(() => {
    if (!lastFriendshipRealtimeEventAt || isInvalidChatRoomId) {
      return;
    }

    void refetchChatRoom();
  }, [isInvalidChatRoomId, lastFriendshipRealtimeEventAt, refetchChatRoom]);

  useEffect(() => {
    if (pinnedMessagesData?.data) {
      const pinnedIds = new Set(pinnedMessagesData.data.map((msg: PinnedMessage) => msg.messageId));
      setPinnedMessageIds(pinnedIds);
    }
  }, [pinnedMessagesData]);

  const currentChatRoom = useMemo(() => {
    return chatRoomsData?.data || null;
  }, [chatRoomsData]);

  const {
    data: ongoingCallData,
    isFetching: isFetchingOngoingCall,
    isError: isOngoingCallError,
    refetch: refetchOngoingCall,
  } = useGetCurrentCallQuery(
    { chatRoomId: parsedChatRoomId },
    {
      skip: isInvalidChatRoomId || currentChatRoom?.type !== ChatRoomType.GROUP,
      pollingInterval: 10000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  useEffect(() => {
    if (currentChatRoom?.type !== ChatRoomType.GROUP || !lastCallRealtimeEventAt) {
      return;
    }

    void refetchOngoingCall();
  }, [currentChatRoom?.type, lastCallRealtimeEventAt, refetchOngoingCall]);

  const ongoingGroupCall = useMemo(() => {
    if (currentChatRoom?.type !== ChatRoomType.GROUP) {
      return null;
    }

    const activeLocalCall =
      currentCall?.chatRoomId === parsedChatRoomId &&
      (currentCall.status === CallStatusEnum.ACTIVE || currentCall.status === CallStatusEnum.PENDING)
        ? currentCall
        : null;

    const activeServerCall =
      ongoingCallData?.data &&
      (ongoingCallData.data.status === CallStatusEnum.ACTIVE || ongoingCallData.data.status === CallStatusEnum.PENDING)
        ? ongoingCallData.data
        : null;

    let candidate: CallSession | null = activeLocalCall ?? activeServerCall;

    if (activeLocalCall && activeServerCall && activeLocalCall.sessionId === activeServerCall.sessionId) {
      candidate = {
        ...activeServerCall,
        rtc: activeLocalCall.rtc ?? activeServerCall.rtc,
        callType: activeLocalCall.callType ?? activeServerCall.callType,
      };
    }

    if (!candidate) {
      return null;
    }

    const isRealtimeEndedEventForCandidate =
      lastCallRealtimeEvent?.chatRoomId === parsedChatRoomId &&
      lastCallRealtimeEvent.sessionId === candidate.sessionId &&
      (lastCallRealtimeEvent.eventType === 'CALL_ENDED' ||
        lastCallRealtimeEvent.status === CallStatusEnum.ENDED ||
        lastCallRealtimeEvent.status === CallStatusEnum.CANCELLED);

    if (isRealtimeEndedEventForCandidate || isOngoingCallError) {
      return null;
    }

    return candidate;
  }, [
    currentCall,
    currentChatRoom?.type,
    isOngoingCallError,
    lastCallRealtimeEvent,
    ongoingCallData?.data,
    parsedChatRoomId,
  ]);

  const isDirectBlocked = currentChatRoom?.type === ChatRoomType.DIRECT && Boolean(currentChatRoom?.blocked);
  const isBlockedByMe = isDirectBlocked && Boolean(currentChatRoom?.blockedByMe);
  const blockedReason = isBlockedByMe
    ? 'Bạn đã chặn người này. Hãy bỏ chặn để tiếp tục nhắn tin.'
    : 'Bạn không thể nhắn tin với người này.';
  const canRenderCallWindow =
    Boolean(currentCall) &&
    typeof user?.accountId === 'number' &&
    Boolean(
      currentCall?.participants.some(
        (participant) => participant.account.accountId === user.accountId && !participant.leftAt,
      ),
    );
  const isGroupCall = currentChatRoom?.type === ChatRoomType.GROUP;
  const isCurrentUserInOngoingGroupCall =
    Boolean(ongoingGroupCall) &&
    typeof user?.accountId === 'number' &&
    Boolean(
      ongoingGroupCall?.participants.some(
        (participant) => participant.account.accountId === user.accountId && !participant.leftAt,
      ),
    );
  const canJoinOngoingGroupCall =
    isGroupCall && Boolean(ongoingGroupCall) && !isCurrentUserInOngoingGroupCall && !canRenderCallWindow;
  const activeCallRoomType = currentCall?.chatRoomType || currentChatRoom?.type;
  const activeCallRoomName = currentCall?.chatRoomName || currentChatRoom?.name;
  const activeCallRoomAvatar = currentCall?.chatRoomAvatar || currentChatRoom?.avatar || null;
  const isActiveGroupCall = activeCallRoomType === ChatRoomType.GROUP;
  const isCurrentUserCallInitiator = Boolean(currentCall?.initiatorAccountId === user?.accountId);
  const canCurrentUserEndActiveCall = Boolean(!isActiveGroupCall || isCurrentUserCallInitiator);
  const canCurrentUserLeaveActiveCall = Boolean(currentCall);

  const handleJoinOngoingGroupCall = useCallback(async () => {
    if (!ongoingGroupCall || isJoiningOngoingCall) {
      return;
    }

    setIsJoiningOngoingCall(true);
    try {
      await handleJoinCallSession(
        ongoingGroupCall.chatRoomId,
        ongoingGroupCall.sessionId,
        ongoingGroupCall.callType ?? CallTypeEnum.VOICE,
      );
    } finally {
      setIsJoiningOngoingCall(false);
    }
  }, [handleJoinCallSession, isJoiningOngoingCall, ongoingGroupCall]);

  const handleNavigateToMessage = useCallback((targetMessageId: string) => {
    if (!targetMessageId) return;

    const rawId = targetMessageId;

    const findMessageElement = (): HTMLElement | null => {
      const nodes = document.querySelectorAll('[data-message-id]');
      for (const n of Array.from(nodes)) {
        try {
          const val = (n as Element).getAttribute('data-message-id');
          if (val === rawId) return n as HTMLElement;
        } catch {
          // ignore
        }
      }
      return null;
    };

    const findCollapsedButtonContainingId = (): HTMLElement | null => {
      const nodes = document.querySelectorAll('[data-collapsed-ids]');
      for (const n of Array.from(nodes)) {
        try {
          const attr = (n as Element).getAttribute('data-collapsed-ids') || '';
          const parts = attr.split(/\s+/).filter(Boolean);
          if (parts.includes(rawId)) return n as HTMLElement;
        } catch {
          // ignore
        }
      }
      return null;
    };

    const highlightAndScroll = (targetElement: HTMLElement) => {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.focus({ preventScroll: true });

      const highlightClass = 'message-highlight';
      const bubbleElement = targetElement.querySelector(
        '.rounded-2xl, .rounded-xl, img, video, audio',
      ) as HTMLElement | null;
      const elToHighlight = bubbleElement || targetElement;

      elToHighlight.classList.remove(highlightClass);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      elToHighlight.offsetWidth;
      elToHighlight.classList.add(highlightClass);

      setTimeout(() => {
        elToHighlight.classList.remove(highlightClass);
      }, 2000);
    };

    void (async () => {
      let targetElement = findMessageElement();

      if (!targetElement) {
        const collapsedButton = findCollapsedButtonContainingId();
        if (collapsedButton) {
          // Ask the MessageList to expand the group that contains this message
          document.dispatchEvent(new CustomEvent('expand-system-group', { detail: rawId }));

          // Wait for the message element to be rendered after expansion using MutationObserver
          targetElement = await new Promise<HTMLElement | null>((resolve) => {
            const existing = findMessageElement();
            if (existing) {
              resolve(existing);
              return;
            }

            const observer = new MutationObserver(() => {
              const found = findMessageElement();
              if (found) {
                observer.disconnect();
                resolve(found);
              }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
              observer.disconnect();
              resolve(null);
            }, 5000);
          });
        }
      }

      if (!targetElement) return;
      highlightAndScroll(targetElement);
    })();
  }, []);

  const handlePinMessage = useCallback(
    async (messageId: string) => {
      try {
        setPinningMessageIds((prev) => new Set([...prev, messageId]));
        await pinMessage({
          chatRoomId: parsedChatRoomId,
          messageId,
        }).unwrap();
        setPinnedMessageIds((prev) => new Set([...prev, messageId]));
        toast.success('Tin nhắn đã được ghim');
      } catch (error: unknown) {
        toast.error((error as IBackendError).data?.message || 'Không thể ghim tin nhắn');
      } finally {
        setPinningMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [parsedChatRoomId, pinMessage],
  );

  const handleUnpinMessage = useCallback(
    async (messageId: string) => {
      try {
        setPinningMessageIds((prev) => new Set([...prev, messageId]));
        await unpinMessage({
          chatRoomId: parsedChatRoomId,
          messageId,
        }).unwrap();
        setPinnedMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
        toast.success('Bỏ ghim tin nhắn thành công');
      } catch (error: unknown) {
        toast.error((error as IBackendError).data?.message || 'Không thể bỏ ghim tin nhắn');
      } finally {
        setPinningMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [parsedChatRoomId, unpinMessage],
  );

  const handleOpenForwardModal = (message: MessageResponse) => {
    setForwardMessage(message);
    setForwardModalOpen(true);
  };

  const handleForwardModalOpenChange = (open: boolean) => {
    setForwardModalOpen(open);
    if (!open) {
      setForwardMessage(null);
    }
  };

  const handleConfirmForward = async (targetChatRoomIds: number[]) => {
    if (!forwardMessage) {
      return null;
    }

    const result = await handleForwardMessage(parsedChatRoomId, forwardMessage.messageId, targetChatRoomIds);

    if (result && result.failedCount === 0) {
      handleForwardModalOpenChange(false);
    }

    return result;
  };

  if (isLoadingInitialMessages || isLoadingChatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="animate-spin mr-2" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!currentChatRoom || !user?.accountId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Có lỗi xảy ra. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <>
      <ChatWindow
        chatRoom={currentChatRoom}
        messages={messages}
        currentUserId={user?.accountId?.toString()}
        isChatBlocked={isDirectBlocked}
        chatBlockedReason={blockedReason}
        onDirectRelationshipChanged={() => {
          void refetchChatRoom();
        }}
        onSendMessage={async (text, files, replyToMessageId) => {
          if (isDirectBlocked) {
            return;
          }

          await handleSendMessage(parsedChatRoomId, text, files, replyToMessageId);
          setReplyMessage(null);
        }}
        onSendContactCards={async (selectedUserIds) => {
          if (isDirectBlocked) {
            return null;
          }

          return await handleSendContactCards(parsedChatRoomId, selectedUserIds);
        }}
        replyTarget={replyMessage}
        onCancelReply={() => setReplyMessage(null)}
        onReplyMessage={setReplyMessage}
        onNavigateToMessage={handleNavigateToMessage}
        onLoadOlderMessages={loadOlderMessages}
        hasOlderMessages={hasOlderMessages}
        isLoadingOlderMessages={isLoadingOlderMessages}
        onForwardMessage={handleOpenForwardModal}
        isForwardingMessage={isForwardingMessage}
        onHideMessage={async (messageId) => {
          await handleHideMessage(parsedChatRoomId, messageId);
        }}
        isHidingMessage={isHidingMessage}
        onDeleteMessage={async (messageId) => {
          await handleDeleteMessage(parsedChatRoomId, messageId);
        }}
        isDeletingMessage={isDeletingMessage}
        onRecallMessage={async (messageId) => {
          await handleRecallMessage(parsedChatRoomId, messageId);
        }}
        isRecallingMessage={isRecallingMessage}
        onPinMessage={handlePinMessage}
        onUnpinMessage={handleUnpinMessage}
        isPinnedMessage={(messageId: string) => pinnedMessageIds.has(messageId)}
        isPinningMessage={(messageId: string) => pinningMessageIds.has(messageId)}
        pinnedMessages={pinnedMessagesData?.data || []}
        isLoadingPinnedMessages={isLoadingPinnedMessages}
        onStartVoiceCall={async () => {
          await handleStartCall(parsedChatRoomId, CallTypeEnum.VOICE);
        }}
        onStartVideoCall={async () => {
          await handleStartCall(parsedChatRoomId, CallTypeEnum.VIDEO);
        }}
        showOngoingCallInfo={isGroupCall && Boolean(ongoingGroupCall)}
        callSession={ongoingGroupCall}
        ongoingParticipantsCount={
          ongoingGroupCall?.participants.filter((participant) => !participant.leftAt).length ?? 0
        }
        canJoinOngoingCall={canJoinOngoingGroupCall}
        isJoiningOngoingCall={isJoiningOngoingCall || isFetchingOngoingCall}
        onJoinOngoingCall={() => {
          void handleJoinOngoingGroupCall();
        }}
      />

      <ForwardMessageModal
        open={forwardModalOpen}
        onOpenChange={handleForwardModalOpenChange}
        sourceChatRoomId={parsedChatRoomId}
        message={forwardMessage}
        isSubmitting={isForwardingMessage}
        onConfirm={handleConfirmForward}
      />

      {canRenderCallWindow && currentCall && activeCallRoomType && activeCallRoomName && (
        <CallWindow
          currentCall={currentCall}
          callError={callError}
          rtcConnectionState={rtcConnectionState}
          localAudioEnabled={localAudioEnabled}
          localVideoEnabled={localVideoEnabled}
          participantMediaStates={participantMediaStates}
          remoteAudioActive={remoteAudioActive}
          remoteVideoActive={remoteVideoActive}
          currentUserId={user.accountId}
          chatRoomType={activeCallRoomType}
          chatRoomName={activeCallRoomName}
          chatRoomAvatar={activeCallRoomAvatar}
          isEndingCall={isEndingCall}
          isLeavingCall={isLeavingCall}
          canCurrentUserEndCall={canCurrentUserEndActiveCall}
          canCurrentUserLeaveCall={canCurrentUserLeaveActiveCall}
          handleEndCallAction={handleEndCall}
          handleLeaveCallAction={handleLeaveCall}
          handleToggleLocalAudio={handleToggleLocalAudio}
          handleToggleLocalVideo={handleToggleLocalVideo}
          availableCallDevices={availableCallDevices}
          selectedCallDevices={selectedCallDevices}
          isLoadingCallDevices={isLoadingCallDevices}
          updatingCallDeviceKind={updatingCallDeviceKind}
          handleSelectCallDevice={handleSelectCallDevice}
          bindRtcContainers={bindRtcContainers}
          bindParticipantVideoContainer={bindParticipantVideoContainer}
        />
      )}
    </>
  );
}
