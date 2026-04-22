'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Mic, MicOff, UserRound } from 'lucide-react';

type CallParticipantCardProps = {
  accountId: number;
  fullName: string;
  avatar?: string | null;
  subtitle: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  bindParticipantVideoContainer?: (params: { accountId: number; container: HTMLElement | null }) => void;
};

export function CallParticipantCard({
  accountId,
  fullName,
  avatar,
  subtitle,
  videoEnabled,
  audioEnabled,
  bindParticipantVideoContainer,
}: Readonly<CallParticipantCardProps>) {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bindParticipantVideoContainer || !videoEnabled) {
      bindParticipantVideoContainer?.({ accountId, container: null });
      return;
    }

    bindParticipantVideoContainer({ accountId, container: videoContainerRef.current });

    return () => {
      bindParticipantVideoContainer({ accountId, container: null });
    };
  }, [accountId, bindParticipantVideoContainer, videoEnabled]);

  return (
    <article className="flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-sm">
      <div className="relative flex min-h-[190px] flex-1 items-center justify-center overflow-hidden bg-muted/40">
        {videoEnabled ? (
          <div ref={videoContainerRef} className="h-full min-h-[190px] w-full bg-black/90" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <Avatar className="size-20 border-2 border-border md:size-24">
              <AvatarImage src={avatar || '/placeholder.svg'} alt={fullName} />
              <AvatarFallback>{fullName.trim().charAt(0) || <UserRound className="h-8 w-8" />}</AvatarFallback>
            </Avatar>
          </div>
        )}

        <Badge variant="secondary" className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium">
          {videoEnabled ? (
            <>
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              Camera bật
            </>
          ) : (
            <>
              <CameraOff className="mr-1.5 h-3.5 w-3.5" />
              Camera tắt
            </>
          )}
        </Badge>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="space-y-1">
          <p className="truncate text-base font-semibold text-foreground">{fullName}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            {videoEnabled ? (
              <Camera className="mr-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <CameraOff className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            )}
            {videoEnabled ? 'Video đang phát' : 'Chưa bật camera'}
          </Badge>

          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            {audioEnabled ? (
              <Mic className="mr-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <MicOff className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            )}
            {audioEnabled ? 'Âm thanh bình thường' : 'Không có âm thanh'}
          </Badge>
        </div>
      </div>
    </article>
  );
}
