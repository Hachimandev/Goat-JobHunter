import { Loader2, Play } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ColumnsPhotoAlbum, ClickHandlerProps, RenderPhotoContext, RenderPhotoProps } from 'react-photo-album';
import { MessageResponse } from '@/types/model';
import { ChatMediaLightbox } from './ChatMediaLightbox';
import formatChatMediaForPhotoAlbum, { ChatMediaPhoto } from '@/utils/formatChatMediaForPhotoAlbum';

interface SharedMediaGridProps {
  readonly media: MessageResponse[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

function RenderChatMediaPhoto(
  { onClick }: RenderPhotoProps,
  { photo, width, height }: RenderPhotoContext<ChatMediaPhoto>,
) {
  const isVideo = photo.mediaKind === 'video';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block w-full overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90"
    >
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        {isVideo ? (
          <>
            <video
              src={photo.src}
              preload="metadata"
              muted
              playsInline
              className="h-full w-full rounded-lg border object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-white/90 p-2">
                <Play className="h-4 w-4 fill-black text-black" />
              </div>
            </div>
          </>
        ) : (
          <Image
            src={photo.src}
            alt={photo.alt || 'Media'}
            fill
            sizes="(max-width: 1024px) 33vw, 140px"
            className="rounded-lg border object-cover"
          />
        )}
      </div>
    </button>
  );
}

export function SharedMediaGrid({ media, isLoading, isError }: SharedMediaGridProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mediaPhotos = useMemo(() => formatChatMediaForPhotoAlbum(media), [media]);
  const selectedPhotoIndex = mediaPhotos.length === 0 ? 0 : Math.min(selectedIndex, mediaPhotos.length - 1);

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

  if (mediaPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Chưa có phương tiện hỗ trợ
      </div>
    );
  }

  const handleOpenLightbox = ({ index }: ClickHandlerProps<ChatMediaPhoto>) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <ColumnsPhotoAlbum
        photos={mediaPhotos}
        columns={3}
        spacing={4}
        padding={0}
        onClick={handleOpenLightbox}
        render={{ photo: RenderChatMediaPhoto }}
      />

      <ChatMediaLightbox
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        photos={mediaPhotos}
        selectedIndex={selectedPhotoIndex}
        onSelectedIndexChange={setSelectedIndex}
      />
    </>
  );
}
