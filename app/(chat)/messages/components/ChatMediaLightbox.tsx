import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
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
  if (photos.length === 0) {
    return null;
  }

  const selectedPhoto = photos[selectedIndex];

  if (!selectedPhoto) {
    return null;
  }

  const isSelectedVideo = selectedPhoto.mediaKind === 'video';

  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < photos.length - 1;

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
            aria-label="Previous image"
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
            aria-label="Next image"
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
