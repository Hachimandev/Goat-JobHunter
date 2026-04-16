import { Loader2, Music, Play } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ClickHandlerProps, RenderPhotoContext, RenderPhotoProps, RowsPhotoAlbum } from 'react-photo-album';
import { MessageResponse } from '@/types/model';
import { ChatMediaLightbox } from './ChatMediaLightbox';
import formatChatMediaForPhotoAlbum, { ChatMediaPhoto } from '@/utils/formatChatMediaForPhotoAlbum';
import 'react-photo-album/rows.css';
import 'react-photo-album/columns.css';

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
  const isAudio = photo.mediaKind === 'audio';
  const isImage = photo.mediaKind === 'image';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block w-full overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90"
    >
      <div className="relative w-full cursor-pointer" style={{ aspectRatio: `${width} / ${height}` }}>
        {isVideo && (
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
        )}
        {isAudio && (
          <div className="relative flex h-full w-full items-center justify-center rounded-lg border bg-linear-to-br from-muted to-muted/70">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Music className="h-7 w-7" />
              <span className="text-[11px] font-medium uppercase tracking-wide">Audio</span>
            </div>
          </div>
        )}
        {isImage && (
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
      <RowsPhotoAlbum
        photos={mediaPhotos}
        spacing={0}
        padding={0}
        rowConstraints={{
          minPhotos: 1,
          maxPhotos: 3,
        }}
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
