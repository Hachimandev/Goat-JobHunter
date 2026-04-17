import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Music, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { ChatMediaPhoto } from '@/utils/formatChatMediaForPhotoAlbum';

interface ChatMediaLightboxProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly photos: ChatMediaPhoto[];
  readonly selectedIndex: number;
  readonly onSelectedIndexChange: (index: number) => void;
}

export function ChatMediaLightbox({
  open,
  onOpenChange,
  photos,
  selectedIndex,
  onSelectedIndexChange,
}: Readonly<ChatMediaLightboxProps>) {
  const selectedPhoto = photos[selectedIndex];
  const hasMedia = photos.length > 0 && Boolean(selectedPhoto);
  const hasPrevious = hasMedia && selectedIndex > 0;
  const hasNext = hasMedia && selectedIndex < photos.length - 1;

  const handlePrevious = () => {
    if (!hasPrevious) {
      return;
    }

    onSelectedIndexChange(selectedIndex - 1);
  };

  const handleNext = () => {
    if (!hasNext) {
      return;
    }

    onSelectedIndexChange(selectedIndex + 1);
  };

  useEffect(() => {
    if (!open || !hasMedia) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious) {
        event.preventDefault();
        onSelectedIndexChange(selectedIndex - 1);
      }

      if (event.key === 'ArrowRight' && hasNext) {
        event.preventDefault();
        onSelectedIndexChange(selectedIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMedia, hasNext, hasPrevious, onSelectedIndexChange, open, selectedIndex]);

  if (!selectedPhoto) {
    return null;
  }

  const isSelectedVideo = selectedPhoto.mediaKind === 'video';
  const isSelectedAudio = selectedPhoto.mediaKind === 'audio';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl! w-[min(92vw,1100px)] h-[min(90vh,820px)] p-0 overflow-hidden border-none bg-black"
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0">
            {isSelectedVideo ? (
              <video src={selectedPhoto.src} controls autoPlay playsInline className="h-full w-full object-contain" />
            ) : isSelectedAudio ? (
              <div className="flex h-full w-full items-center justify-center bg-black/80 px-6">
                <div className="flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-white/15 bg-white/5 p-6">
                  <div className="rounded-full bg-white/15 p-3">
                    <Music className="h-7 w-7 text-white" />
                  </div>
                  <audio src={selectedPhoto.src} controls preload="metadata" className="w-full" />
                </div>
              </div>
            ) : (
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt || 'Shared media'}
                fill
                priority
                sizes="(max-width: 768px) 92vw, 85vw"
                className="object-contain"
              />
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close gallery"
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            onClick={handlePrevious}
            disabled={!hasPrevious}
            aria-label="Previous media"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            onClick={handleNext}
            disabled={!hasNext}
            aria-label="Next media"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
