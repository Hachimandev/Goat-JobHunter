'use client';

import useUpdateAvatar, { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/app/(main)/profile/hooks/useUpdateAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { capitalize } from 'lodash';
import { ImageIcon, Loader2, X } from 'lucide-react';

interface UpdateAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  field?: 'avatar' | 'coverPhoto';
}

export default function UpdateAvatarDialog({
  open,
  onOpenChange,
  type,
  field = 'avatar',
}: Readonly<UpdateAvatarDialogProps>) {
  const { selectedImage, previewUrl, isSubmitting, handleImageDrop, handleRemoveImage, handleSubmit, handleError } =
    useUpdateAvatar(type, field);

  const handleUploadAndUpdate = async () => {
    await handleSubmit();
    onOpenChange(false);
  };

  const handleCancel = () => {
    handleRemoveImage();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {field === 'coverPhoto' ? 'Cập Nhật Ảnh Bìa' : 'Cập Nhật Ảnh Đại Diện'}
          </DialogTitle>
          <DialogDescription>
            {field === 'coverPhoto'
              ? 'Tải lên ảnh bìa mới cho tài khoản của bạn'
              : 'Tải lên ảnh đại diện mới cho tài khoản của bạn'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!previewUrl ? (
            <Dropzone
              accept={ACCEPTED_IMAGE_TYPES}
              maxFiles={1}
              maxSize={MAX_FILE_SIZE}
              onDrop={handleImageDrop}
              onError={handleError}
              disabled={isSubmitting}
              className="rounded-xl min-h-[200px]"
            >
              <DropzoneEmptyState customCaption>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để tải lên ảnh đại diện mới</p>
                  <p className="text-xs text-muted-foreground">
                    {Object.values(ACCEPTED_IMAGE_TYPES)
                      .map((type) => type[0])
                      .map((ext) => capitalize(ext.slice(1)))
                      .join(', ')}{' '}
                    (tối đa {MAX_FILE_SIZE / 1024 / 1024} MB)
                  </p>
                </div>
              </DropzoneEmptyState>
            </Dropzone>
          ) : (
            <div className="space-y-3">
              <div className="flex group items-center justify-center">
                {field === 'coverPhoto' ? (
                  <div className="relative w-full h-40 rounded-lg border-4 border-primary/10 bg-muted flex items-center justify-center overflow-hidden">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview Cover Photo" className="h-full w-full object-cover" />
                    )}
                    <Button
                      onClick={handleRemoveImage}
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative h-64 w-64 rounded-full border-4 border-primary/10 bg-muted flex items-center justify-center">
                    {previewUrl && (
                      <Avatar className="h-full w-full">
                        <AvatarImage src={previewUrl} alt={'Preview Avatar'} className="object-cover aspect-square" />
                      </Avatar>
                    )}
                    <Button
                      onClick={handleRemoveImage}
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
                <ImageIcon className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedImage?.name}</p>
                  <p className="text-xs">{((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="rounded-xl">
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleUploadAndUpdate}
            disabled={isSubmitting || !selectedImage}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
