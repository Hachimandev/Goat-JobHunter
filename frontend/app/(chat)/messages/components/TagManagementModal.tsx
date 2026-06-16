'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Edit2, Tag } from 'lucide-react';
import { useDeleteTagMutation, useFetchTagsQuery } from '@/services/tag/tagApi';
import type { ChatRoom, Tag as TagType } from '@/types/model';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { TagForm } from './TagForm';
import { IBackendError } from '@/types/api';

interface TagManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatRooms: ChatRoom[];
}

export function TagManagementModal({ open, onOpenChange, chatRooms }: TagManagementModalProps) {
  const { user: currentUser } = useUser();
  const { data: tagsResponse, refetch } = useFetchTagsQuery({ page: 1, size: 50 }, { skip: !currentUser });

  const [deleteTag, { isLoading: isDeletingTagMutationLoading }] = useDeleteTagMutation();

  const [openForm, setOpenForm] = useState(false);

  const [editTag, setEditTag] = useState<TagType | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);

  const tags = useMemo(() => tagsResponse?.data?.result ?? [], [tagsResponse]);

  const handleDeleteTag = async (tagId: number) => {
    try {
      setDeletingTagId(tagId);
      await deleteTag(tagId).unwrap();
      refetch();
    } catch (error) {
      const errorMessage = (error as IBackendError)?.data?.message || 'Không thể tạo thẻ';
      toast.error(errorMessage);
    } finally {
      setDeletingTagId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl gap-0">
          <DialogHeader className="p-2 border-b">
            <DialogTitle className="text-lg font-semibold">Quản lý thẻ phân loại</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div>
              {tags.length - 1 > 0 ? (
                <div className="space-y-2">
                  {tags.map(
                    (tag) =>
                      tag.name !== 'Người lạ' && (
                        <div key={tag.tagId}>
                          <div className="flex items-center gap-2 p-2 my-2 rounded-lg hover:bg-accent/50 group transition-colors hover:cursor-pointer">
                            <Tag className={`h-4 w-4 stroke-4`} style={{ color: tag.color }} />
                            <span className="flex-1 text-sm font-semibold truncate">{tag.name}</span>
                            <button
                              onClick={() => {
                                setEditTag(tag);
                                setOpenForm(true);
                              }}
                              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Sửa"
                            >
                              <Edit2 className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.tagId)}
                              disabled={isDeletingTagMutationLoading && deletingTagId === tag.tagId}
                              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-100"
                              title="Xóa"
                            >
                              {isDeletingTagMutationLoading && deletingTagId === tag.tagId ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">Chưa có thẻ phân loại nào</div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-2">
            <Button
              onClick={() => {
                setOpenForm(true);
                setEditTag(null);
              }}
              className="w-full rounded-lg"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm phân loại
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TagForm
        open={openForm}
        onOpenChange={setOpenForm}
        tags={tags}
        chatRooms={chatRooms}
        refetchTags={refetch}
        tag={editTag || undefined}
      />
    </>
  );
}
