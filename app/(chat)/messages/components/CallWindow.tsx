'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallStatusEnum, CallTypeEnum, ChatRoomType } from '@/types/enum';
import { CallSession } from '@/types/model';
import { DoorOpen, Dot, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type CallWindowProps = {
  currentCall: CallSession;
  callError: string | null;
  rtcConnectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteAudioActive: boolean;
  remoteVideoActive: boolean;
  currentUserId: number;
  chatRoomType: ChatRoomType;
  chatRoomName: string;
  chatRoomAvatar?: string | null;
  isEndingCall: boolean;
  canCurrentUserEndCall: boolean;
  handleCloseCallAction: () => Promise<void> | void;
  handleToggleLocalAudio: () => Promise<void> | void;
  handleToggleLocalVideo: () => Promise<void> | void;
  bindRtcContainers: (params: {
    localVideoContainer?: HTMLElement | null;
    remoteVideoContainer?: HTMLElement | null;
  }) => void;
};

export function CallWindow({
  currentCall,
  callError,
  rtcConnectionState,
  localAudioEnabled,
  localVideoEnabled,
  remoteAudioActive,
  remoteVideoActive,
  currentUserId,
  chatRoomType,
  chatRoomName,
  chatRoomAvatar,
  isEndingCall,
  canCurrentUserEndCall,
  handleCloseCallAction,
  handleToggleLocalAudio,
  handleToggleLocalVideo,
  bindRtcContainers,
}: Readonly<CallWindowProps>) {
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentCall) {
      bindRtcContainers({ localVideoContainer: null, remoteVideoContainer: null });
      return;
    }

    bindRtcContainers({
      localVideoContainer: localVideoRef.current,
      remoteVideoContainer: remoteVideoRef.current,
    });
  }, [bindRtcContainers, currentCall]);

  const { statusLabel, iconDotColor } = useMemo(() => {
    switch (currentCall.status) {
      case CallStatusEnum.PENDING: {
        return { statusLabel: 'Đang chờ tham gia', iconDotColor: 'bg-amber-400' };
      }
      case CallStatusEnum.ACTIVE: {
        return { statusLabel: 'Đang trong cuộc gọi', iconDotColor: 'bg-green-500' };
      }
      case CallStatusEnum.ENDED: {
        return { statusLabel: 'Cuộc gọi đã kết thúc', iconDotColor: 'bg-gray-500' };
      }
      case CallStatusEnum.CANCELLED: {
        return { statusLabel: 'Cuộc gọi đã hủy', iconDotColor: 'bg-red-500' };
      }
      default: {
        return { statusLabel: 'Đang xử lý', iconDotColor: 'bg-blue-500' };
      }
    }
  }, [currentCall.status]);

  const showVideoLayout = (currentCall.callType ?? CallTypeEnum.VOICE) === CallTypeEnum.VIDEO;
  const joinedParticipants = currentCall.participants.filter((participant) => !participant.leftAt);
  const sortedJoinedParticipants = [...joinedParticipants].sort((firstParticipant, secondParticipant) => {
    if (firstParticipant.account.accountId === currentUserId) {
      return -1;
    }

    if (secondParticipant.account.accountId === currentUserId) {
      return 1;
    }

    return (firstParticipant.account.fullName || firstParticipant.account.username).localeCompare(
      secondParticipant.account.fullName || secondParticipant.account.username,
    );
  });
  const currentUserInCall = sortedJoinedParticipants.some(
    (participant) => participant.account.accountId === currentUserId,
  );

  const voiceTiles =
    chatRoomType === ChatRoomType.DIRECT && sortedJoinedParticipants.length === 1
      ? [
          {
            key: `${sortedJoinedParticipants[0].account.accountId}`,
            fullName: sortedJoinedParticipants[0].account.fullName || sortedJoinedParticipants[0].account.username,
            avatar: sortedJoinedParticipants[0].account.avatar ?? null,
            subtitle: 'Bạn',
          },
          {
            key: 'direct-counterpart-placeholder',
            fullName: chatRoomName,
            avatar: chatRoomAvatar ?? null,
            subtitle: 'Đang đổ chuông...',
          },
        ]
      : sortedJoinedParticipants.map((participant) => ({
          key: `${participant.account.accountId}`,
          fullName: participant.account.fullName || participant.account.username,
          avatar: participant.account.avatar ?? null,
          subtitle: participant.account.accountId === currentUserId ? 'Bạn' : 'Đang tham gia',
        }));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/15 text-white">
        <div>
          <p className="text-sm font-medium">
            Cuộc gọi đang diễn ra <Dot className={cn('h-3 w-3 rounded-full inline-block ml-2', iconDotColor)} />
          </p>
          <p className="text-xs text-white/70 mt-1">
            {statusLabel} · {rtcConnectionState}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">
        {showVideoLayout ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="lg:col-span-9 rounded-2xl bg-zinc-900 border border-white/10 min-h-[280px] relative overflow-hidden">
              <div ref={remoteVideoRef} className="h-full w-full" />
              {!remoteVideoActive && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Đang chờ video từ đối phương...
                </div>
              )}
            </div>
            <div className="lg:col-span-3 rounded-2xl bg-zinc-900 border border-white/10 min-h-[180px] relative overflow-hidden">
              <div ref={localVideoRef} className="h-full w-full" />
              {!localVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Camera đang tắt
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full rounded-2xl bg-zinc-900 border border-white/10 p-4 pb-9!">
            <div
              className={cn(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full auto-rows-fr',
                voiceTiles.length === 2 && 'grid-cols-2!',
              )}
            >
              {voiceTiles.map((voiceTile) => (
                <div
                  key={voiceTile.key}
                  className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4 flex flex-col items-center justify-center text-center gap-3"
                >
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-white/20">
                    <AvatarImage src={voiceTile.avatar || '/placeholder.svg'} alt={voiceTile.fullName} />
                    <AvatarFallback>{voiceTile.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-white">{voiceTile.fullName}</p>
                    <p className="text-xs text-white/70 mt-1">{voiceTile.subtitle}</p>
                  </div>
                </div>
              ))}

              {!currentUserInCall && (
                <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 flex items-center justify-center text-center text-amber-100 text-sm">
                  Chờ xác nhận tham gia cuộc gọi...
                </div>
              )}

              {voiceTiles.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4 flex items-center justify-center text-center text-white/70 text-sm">
                  Đang chờ thành viên tham gia...
                </div>
              )}
            </div>

            {remoteAudioActive && <p className="text-center text-xs text-emerald-200 mt-3">Âm thanh đã kết nối</p>}
          </div>
        )}
      </div>

      {(callError || rtcConnectionState === 'failed') && (
        <div className="mx-4 md:mx-6 mb-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
          {callError || 'Không thể duy trì kết nối cuộc gọi.'}
        </div>
      )}

      <div className="px-4 md:px-6 py-4 border-t border-white/15 flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/15 hover:bg-white/20 text-white"
          onClick={() => {
            void handleToggleLocalAudio();
          }}
        >
          {localAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        {showVideoLayout && (
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/15 hover:bg-white/20 text-white"
            onClick={() => {
              void handleToggleLocalVideo();
            }}
          >
            {localVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        )}

        <Button
          variant="destructive"
          size="icon"
          className="rounded-full"
          disabled={isEndingCall}
          title={canCurrentUserEndCall ? 'Kết thúc cuộc gọi' : 'Rời cuộc gọi'}
          onClick={() => {
            void handleCloseCallAction();
          }}
        >
          {canCurrentUserEndCall ? <PhoneOff className="h-5 w-5" /> : <DoorOpen className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
