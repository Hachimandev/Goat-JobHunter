'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CallStatusEnum, CallTypeEnum } from '@/types/enum';
import { CallSession } from '@/types/model';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';

type CallWindowProps = {
  currentCall: CallSession;
  callError: string | null;
  rtcConnectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteAudioActive: boolean;
  remoteVideoActive: boolean;
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

  const statusLabel =
    currentCall.status === CallStatusEnum.PENDING
      ? 'Đang chờ tham gia'
      : currentCall.status === CallStatusEnum.ACTIVE
        ? 'Đang trong cuộc gọi'
        : currentCall.status === CallStatusEnum.ENDED
          ? 'Cuộc gọi đã kết thúc'
          : currentCall.status === CallStatusEnum.CANCELLED
            ? 'Cuộc gọi đã hủy'
            : 'Đang xử lý';

  const showVideoLayout = (currentCall.callType ?? CallTypeEnum.VOICE) === CallTypeEnum.VIDEO;
  const joinedParticipants = currentCall.participants.filter((participant) => !participant.leftAt);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/15 text-white">
        <div>
          <p className="text-sm font-medium">Cuộc gọi #{currentCall.sessionId}</p>
          <p className="text-xs text-white/70">
            {statusLabel} · {rtcConnectionState}
          </p>
          <p className="text-xs text-white/60 mt-1">
            Đang tham gia ({joinedParticipants.length}):{' '}
            {joinedParticipants.length > 0
              ? joinedParticipants.map((participant) => `#${participant.accountId}`).join(', ')
              : 'Chưa có thành viên'}
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
          <div className="h-full rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white/75">
            {remoteAudioActive ? 'Đang kết nối âm thanh với đối phương' : 'Đang chờ đối phương tham gia âm thanh...'}
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
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
