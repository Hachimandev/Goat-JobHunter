'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallStatusEnum, CallTypeEnum, ChatRoomType } from '@/types/enum';
import { CallSession } from '@/types/model';
import {
  Camera,
  CameraOff,
  DoorOpen,
  Dot,
  Mic,
  MicOff,
  PhoneOff,
  Settings2,
  UserRound,
  Video,
  VideoOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CallParticipantCard } from '@/app/(chat)/messages/components/CallParticipantCard';
import { CallDeviceSettingsDialog } from '@/app/(chat)/messages/components/CallDeviceSettingsDialog';
import type { CallDevicePreferencesState } from '@/lib/features/callDevicePreferencesSlice';
import type { CallDeviceInventory, CallDeviceKind } from '@/services/callRtc/callDeviceUtils';

type CallWindowProps = {
  currentCall: CallSession;
  callError: string | null;
  rtcConnectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  participantMediaStates: Record<number, { audioActive: boolean; videoActive: boolean }>;
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
  availableCallDevices: CallDeviceInventory;
  selectedCallDevices: CallDevicePreferencesState;
  isLoadingCallDevices: boolean;
  updatingCallDeviceKind: CallDeviceKind | null;
  handleSelectCallDevice: (kind: CallDeviceKind, deviceId: string | null) => Promise<void> | void;
  bindRtcContainers: (params: {
    localVideoContainer?: HTMLElement | null;
    remoteVideoContainer?: HTMLElement | null;
  }) => void;
  bindParticipantVideoContainer: (params: { accountId: number; container: HTMLElement | null }) => void;
};

export function CallWindow({
  currentCall,
  callError,
  rtcConnectionState,
  localAudioEnabled,
  localVideoEnabled,
  participantMediaStates,
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
  availableCallDevices,
  selectedCallDevices,
  isLoadingCallDevices,
  updatingCallDeviceKind,
  handleSelectCallDevice,
  bindRtcContainers,
  bindParticipantVideoContainer,
}: Readonly<CallWindowProps>) {
  const mainStageRef = useRef<HTMLDivElement | null>(null);
  const secondaryStageRef = useRef<HTMLDivElement | null>(null);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);

  const showVideoLayout = (currentCall.callType ?? CallTypeEnum.VOICE) === CallTypeEnum.VIDEO;
  const isGroupVideoLayout = showVideoLayout && chatRoomType === ChatRoomType.GROUP;
  const joinedParticipants = currentCall.participants.filter((participant) => !participant.leftAt);
  const remoteParticipant =
    joinedParticipants.find((participant) => participant.account.accountId !== currentUserId) ?? null;
  const remoteDisplayName =
    remoteParticipant?.account.fullName || remoteParticipant?.account.username || chatRoomName || 'Đối phương';
  const remoteAvatar = remoteParticipant?.account.avatar ?? chatRoomAvatar ?? null;
  const stageShowsLocalVideo = showVideoLayout && localVideoEnabled && !remoteVideoActive;

  useEffect(() => {
    if (!currentCall) {
      bindRtcContainers({ localVideoContainer: null, remoteVideoContainer: null });
      return;
    }

    if (isGroupVideoLayout) {
      bindRtcContainers({ localVideoContainer: null, remoteVideoContainer: null });
      return;
    }

    bindRtcContainers({
      localVideoContainer: stageShowsLocalVideo ? mainStageRef.current : secondaryStageRef.current,
      remoteVideoContainer: stageShowsLocalVideo ? secondaryStageRef.current : mainStageRef.current,
    });
  }, [bindRtcContainers, currentCall, isGroupVideoLayout, stageShowsLocalVideo, remoteVideoActive, localVideoEnabled]);

  const { statusLabel } = useMemo(() => {
    switch (currentCall.status) {
      case CallStatusEnum.PENDING: {
        return { statusLabel: 'Đang chờ tham gia' };
      }
      case CallStatusEnum.ACTIVE: {
        return { statusLabel: 'Đang trong cuộc gọi' };
      }
      case CallStatusEnum.ENDED: {
        return { statusLabel: 'Cuộc gọi đã kết thúc' };
      }
      case CallStatusEnum.CANCELLED: {
        return { statusLabel: 'Cuộc gọi đã hủy' };
      }
      default: {
        return { statusLabel: 'Đang xử lý' };
      }
    }
  }, [currentCall.status]);

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
  const groupVideoTiles = sortedJoinedParticipants.map((participant) => {
    const isCurrentUser = participant.account.accountId === currentUserId;
    const mediaState = isCurrentUser
      ? {
          audioActive: localAudioEnabled,
          videoActive: localVideoEnabled,
        }
      : (participantMediaStates[participant.account.accountId] ?? {
          audioActive: false,
          videoActive: false,
        });

    return {
      accountId: participant.account.accountId,
      fullName: participant.account.fullName || participant.account.username,
      avatar: participant.account.avatar ?? null,
      subtitle: isCurrentUser ? 'Bạn' : 'Đang tham gia',
      audioEnabled: mediaState.audioActive,
      videoEnabled: mediaState.videoActive,
    };
  });

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

  const statusToneClass = cn(
    'inline-block ml-2 h-2.5 w-2.5 rounded-full',
    currentCall.status === CallStatusEnum.ACTIVE && 'bg-primary',
    currentCall.status === CallStatusEnum.PENDING && 'bg-muted-foreground',
    currentCall.status === CallStatusEnum.ENDED && 'bg-muted-foreground',
    currentCall.status === CallStatusEnum.CANCELLED && 'bg-destructive',
    ![CallStatusEnum.ACTIVE, CallStatusEnum.PENDING, CallStatusEnum.ENDED, CallStatusEnum.CANCELLED].includes(
      currentCall.status,
    ) && 'bg-primary',
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-accent-foreground/90 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-muted-foreground px-5 py-4 text-foreground">
        <div>
          <p className="text-sm font-medium text-white">
            Cuộc gọi đang diễn ra <Dot className={statusToneClass} />
          </p>
          <p className="mt-1 text-xs text-secondary">
            {statusLabel} · {rtcConnectionState}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">
        {isGroupVideoLayout ? (
          <div className="h-full rounded-2xl border border-border bg-card p-4 pb-9!">
            <div
              className={cn(
                'grid h-full auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3',
                groupVideoTiles.length === 2 && 'xl:grid-cols-2',
              )}
            >
              {groupVideoTiles.map((participantTile) => (
                <CallParticipantCard
                  key={participantTile.accountId}
                  accountId={participantTile.accountId}
                  fullName={participantTile.fullName}
                  avatar={participantTile.avatar}
                  subtitle={participantTile.subtitle}
                  audioEnabled={participantTile.audioEnabled}
                  videoEnabled={participantTile.videoEnabled}
                  bindParticipantVideoContainer={bindParticipantVideoContainer}
                />
              ))}

              {!currentUserInCall && (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
                  Chờ xác nhận tham gia cuộc gọi...
                </div>
              )}

              {groupVideoTiles.length === 0 && (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                  Đang chờ thành viên tham gia...
                </div>
              )}
            </div>
          </div>
        ) : showVideoLayout ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="relative min-h-80 overflow-hidden rounded-3xl bg-card shadow-sm lg:col-span-8">
              <div ref={mainStageRef} className="h-full w-full" />

              {remoteVideoActive && !stageShowsLocalVideo && (
                <Badge
                  variant="default"
                  className="absolute left-4 top-4 rounded-full px-3 py-1 font-medium backdrop-blur"
                >
                  <span className="inline-flex items-center gap-2">
                    <Camera className="inline-start h-5 w-5" />
                    {remoteDisplayName} đang bật camera
                  </span>
                </Badge>
              )}

              {stageShowsLocalVideo && (
                <Badge
                  variant="default"
                  className="absolute left-4 top-4 rounded-full px-3 py-1 font-medium backdrop-blur"
                >
                  <span className="inline-flex items-center gap-2">
                    <Video className="inline-start h-5 w-5" />
                    Camera của bạn
                  </span>
                </Badge>
              )}

              {!remoteVideoActive && !stageShowsLocalVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center bg-card">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserRound className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">{remoteDisplayName}</p>
                    <p className="text-sm text-muted-foreground">Đối phương chưa bật camera</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground"
                  >
                    <CameraOff className="h-3.5 w-3.5" />
                    {remoteAudioActive ? 'Âm thanh vẫn đang hoạt động' : 'Đang chờ video từ đối phương'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-muted-foreground bg-card shadow-sm">
                <div ref={secondaryStageRef} className="h-full w-full" />

                <div className="absolute right-3 top-3 flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-1 backdrop-blur">
                    {stageShowsLocalVideo ? (
                      remoteVideoActive ? (
                        <>
                          <Camera className="inline-start h-5 w-5" />
                          Camera bật
                        </>
                      ) : (
                        <>
                          <CameraOff className="inline-start h-5 w-5" />
                          Camera tắt
                        </>
                      )
                    ) : localVideoEnabled ? (
                      <>
                        <Video className="inline-start h-5 w-5" />
                        Xem trước bật
                      </>
                    ) : (
                      <>
                        <VideoOff className="inline-start h-5 w-5" />
                        Xem trước tắt
                      </>
                    )}
                  </Badge>
                </div>

                {stageShowsLocalVideo
                  ? !remoteVideoActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                        <Avatar className="size-16 border border-border">
                          <AvatarImage src={remoteAvatar || '/placeholder.svg'} alt={remoteDisplayName} />
                          <AvatarFallback>{remoteDisplayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{remoteDisplayName}</p>
                          <p className="text-xs text-muted-foreground">Chưa bật camera</p>
                        </div>
                      </div>
                    )
                  : !localVideoEnabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                          <VideoOff className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Camera của bạn đang tắt</p>
                          <p className="text-xs text-muted-foreground">Bạn vẫn có thể tiếp tục gọi bằng âm thanh</p>
                        </div>
                      </div>
                    )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Micro</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    {localAudioEnabled ? (
                      <Mic className="h-4 w-4 text-primary" />
                    ) : (
                      <MicOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{localAudioEnabled ? 'Bạn đang nói' : 'Bạn đã tắt mic'}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Đối phương</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    {remoteAudioActive ? (
                      <Mic className="h-4 w-4 text-primary" />
                    ) : (
                      <MicOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{remoteAudioActive ? 'Có âm thanh' : 'Đang im lặng'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full rounded-2xl border border-border bg-card p-4 pb-9!">
            <div
              className={cn(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full auto-rows-fr',
                voiceTiles.length === 2 && 'grid-cols-2!',
              )}
            >
              {voiceTiles.map((voiceTile) => (
                <div
                  key={voiceTile.key}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-center"
                >
                  <Avatar className="size-20 border-2 border-border md:size-24">
                    <AvatarImage src={voiceTile.avatar || '/placeholder.svg'} alt={voiceTile.fullName} />
                    <AvatarFallback>{voiceTile.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground md:text-base">{voiceTile.fullName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{voiceTile.subtitle}</p>
                  </div>
                </div>
              ))}

              {!currentUserInCall && (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
                  Chờ xác nhận tham gia cuộc gọi...
                </div>
              )}

              {voiceTiles.length === 0 && (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                  Đang chờ thành viên tham gia...
                </div>
              )}
            </div>

            {remoteAudioActive && <p className="mt-3 text-center text-xs text-muted-foreground">Âm thanh đã kết nối</p>}
          </div>
        )}
      </div>

      {(callError || rtcConnectionState === 'failed') && (
        <div className="mx-4 mb-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive md:mx-6">
          {callError || 'Không thể duy trì kết nối cuộc gọi.'}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 border-t border-muted-foreground px-4 py-4 md:px-6">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          onClick={() => {
            setIsDeviceSettingsOpen(true);
          }}
          title="Cài đặt thiết bị"
        >
          <Settings2 />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          onClick={() => {
            void handleToggleLocalAudio();
          }}
        >
          {localAudioEnabled ? <Mic /> : <MicOff />}
        </Button>

        {showVideoLayout && (
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => {
              void handleToggleLocalVideo();
            }}
          >
            {localVideoEnabled ? <Video /> : <VideoOff />}
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
          {canCurrentUserEndCall ? <PhoneOff /> : <DoorOpen />}
        </Button>
      </div>

      <CallDeviceSettingsDialog
        open={isDeviceSettingsOpen}
        onOpenChange={setIsDeviceSettingsOpen}
        callType={currentCall.callType ?? CallTypeEnum.VOICE}
        devices={availableCallDevices}
        preferences={selectedCallDevices}
        isLoading={isLoadingCallDevices}
        updatingKind={updatingCallDeviceKind}
        onSelectDevice={handleSelectCallDevice}
      />
    </div>
  );
}
