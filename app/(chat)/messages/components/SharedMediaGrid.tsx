import { Play, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MessageResponse } from '@/types/model';

interface SharedMediaGridProps {
  readonly media: MessageResponse[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function SharedMediaGrid({ media, isLoading, isError }: SharedMediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-destructive">Không thể tải phương tiện</div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Chưa có phương tiện nào</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {media.map((message) => (
        <button
          key={message.messageId}
          className="relative aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity"
        >
          <Image src={message.content} alt="Media" fill className="object-cover border aspect-square rounded-lg" />
          {message.messageType.startsWith('video/') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-white/90 p-2">
                <Play className="h-4 w-4 fill-black text-black" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
