'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChatMediaPhoto } from '@/utils/formatChatMediaForPhotoAlbum';
import { Music, Play } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChatMediaLightbox } from './ChatMediaLightbox';

interface MessageMediaGalleryProps {
  readonly photos: ChatMediaPhoto[];
}

const MAX_VISIBLE_MEDIA = 4;

export function MessageMediaGallery({ photos }: Readonly<MessageMediaGalleryProps>) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const visiblePhotos = useMemo(() => photos.slice(0, MAX_VISIBLE_MEDIA), [photos]);
  const remainingCount = Math.max(photos.length - MAX_VISIBLE_MEDIA, 0);
  const selectedPhotoIndex = photos.length === 0 ? 0 : Math.min(selectedIndex, photos.length - 1);

  if (photos.length === 0) {
    return null;
  }

  const openLightboxAt = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <Card className="w-[min(360px,78vw)] overflow-hidden border bg-card/90 p-1 shadow-sm">
        <div className={cn('grid gap-1', visiblePhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
          {visiblePhotos.map((photo, index) => {
            const isVideo = photo.mediaKind === 'video';
            const isAudio = photo.mediaKind === 'audio';
            const isSingle = visiblePhotos.length === 1;
            const shouldShowRemainingOverlay = index === MAX_VISIBLE_MEDIA - 1 && remainingCount > 0;

            return (
              <button
                key={photo.messageId}
                type="button"
                className={cn(
                  'group relative overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSingle ? 'aspect-4/3' : 'aspect-square',
                )}
                onClick={() => openLightboxAt(index)}
              >
                {isVideo && (
                  <>
                    <video
                      src={photo.src}
                      preload="metadata"
                      muted
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                      <div className="rounded-full bg-white/90 p-2">
                        <Play className="h-4 w-4 fill-black text-black" />
                      </div>
                    </div>
                  </>
                )}

                {isAudio && (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/70">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Music className="h-6 w-6" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">Audio</span>
                    </div>
                  </div>
                )}

                {!isVideo && !isAudio && (
                  <Image
                    src={photo.src}
                    alt={photo.alt || 'Media'}
                    fill
                    sizes={isSingle ? '(max-width: 768px) 78vw, 360px' : '(max-width: 768px) 38vw, 180px'}
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                )}

                {shouldShowRemainingOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                    +{remainingCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <ChatMediaLightbox
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        photos={photos}
        selectedIndex={selectedPhotoIndex}
        onSelectedIndexChange={setSelectedIndex}
      />
    </>
  );
}
