'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useBlogImagesInput } from '@/app/(social-hub)/hub/fyp/hooks/useBlogImagesInput';
import useBlogActions from '@/hooks/useBlogActions';
import LoaderSpin from '@/components/common/LoaderSpin';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MAX_IMAGE_UPLOAD } from '@/constants/constant';
import RichTextEditor from '@/components/RichText/Editor';
import { getDisplayImage, getDisplayImageAlt, getDisplayName, getDisplayUsername } from '../../hooks/useDisplay';
import Image from 'next/image';

interface CreateBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBlogDialog({ open, onOpenChange }: Readonly<CreateBlogDialogProps>) {
  const { user } = useUser();
  const { handleCreateBlog, isCreating } = useBlogActions();
  const [content, setContent] = useState('');

  const { imageFiles, imagePreviews, isDragging, handleFilesAdded, removeImageAt, resetImages } =
    useBlogImagesInput(open);

  const handlePost = async () => {
    await handleCreateBlog({
      content,
      files: imageFiles,
    });

    onOpenChange(false);
    setContent('');
    resetImages();
  };

  const isAllowed = !!content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Tạo bài viết</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={getDisplayImage(user!)} alt={getDisplayImageAlt(user!)} />
              <AvatarFallback>{getDisplayName(user!)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{getDisplayName(user!)}</p>
              <p className="text-muted-foreground text-xs">{getDisplayUsername(user!)}</p>
            </div>
          </div>

          <ScrollArea className="h-[500px] space-y-4">
            <div className="-mx-3 px-4">
              <RichTextEditor
                value={content}
                onChange={(v) => setContent(v)}
                placeholder="Bạn đang nghĩ gì?"
                allowImage={false}
              />
            </div>

            {isDragging && (
              <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-2xl px-6">
                  <Dropzone
                    accept={{ 'image/*': [] }}
                    maxSize={5 * 1024 * 1024}
                    onDrop={handleFilesAdded}
                    multiple
                    maxFiles={MAX_IMAGE_UPLOAD}
                    className="min-h-[400px] rounded-2xl border-dashed border-primary bg-primary/5"
                  >
                    <DropzoneEmptyState customCaption showIcon={false}>
                      <div className="flex flex-col items-center justify-center space-y-4 p-8">
                        <ImageIcon className="h-20 w-20 text-primary" />
                        <div className="text-center space-y-2">
                          <p className="font-semibold text-base text-primary">Thả ảnh vào đây</p>
                        </div>
                      </div>
                    </DropzoneEmptyState>
                  </Dropzone>
                </div>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="group relative overflow-hidden rounded-lg border">
                    <Image
                      src={preview}
                      alt={`Selected image ${index + 1}`}
                      width={300}
                      height={300}
                      className="h-24 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                      onClick={() => removeImageAt(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="rounded-lg border border-border p-2 flex items-center gap-2 justify-between">
            <p className="text-sm font-medium">Thêm vào bài viết của bạn</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    handleFilesAdded(files);
                  };
                  input.click();
                }}
              >
                <ImageIcon className="h-5 w-5 text-green-500" />
              </Button>
            </div>
          </div>

          <div className={cn(!isAllowed && 'cursor-not-allowed')}>
            <Button
              onClick={handlePost}
              variant={isAllowed ? 'default' : 'secondary'}
              disabled={!isAllowed || isCreating}
              className="rounded-xl w-full"
            >
              {isCreating ? (
                <>
                  <LoaderSpin />
                  Đang tải...
                </>
              ) : (
                <>Đăng bài</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
