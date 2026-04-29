'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COLOR_OPTIONS } from '@/constants/constant';
import {
  useAssignTagMutation,
  useCreateTagMutation,
  useUpdateTagMutation,
  useFetchRoomIdsByTagQuery,
} from '@/services/tag/tagApi';
import { IBackendError } from '@/types/api';
import type { ChatRoom, Tag as TagType } from '@/types/model';
import { Loader2, Plus, Tag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TagChatroomSelectorDialog } from './TagChatroomSelectorDialog';

interface TagFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: TagType[];
  chatRooms: ChatRoom[];
  refetchTags: () => void;
  tag?: TagType;
}

export function TagForm({ open, onOpenChange, tags, chatRooms, refetchTags, tag }: Readonly<TagFormProps>) {
  const [tagName, setTagName] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [showChatroomSelector, setShowChatroomSelector] = useState(false);
  const [selectedChatRoomIds, setSelectedChatRoomIds] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const { data: assignedRoomIds, isLoading: isFetchingRoomIds } = useFetchRoomIdsByTagQuery(tag?.tagId ?? -1, {
    skip: !tag || !open,
  });

  useEffect(() => {
    if (open && tag) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTagName(tag.name);
      setSelectedColor(tag.color);
      setIsEditing(true);
      if (assignedRoomIds?.data) {
        setSelectedChatRoomIds(assignedRoomIds.data);
      }
    } else if (!open) {
      setTagName('');
      setSelectedColor(COLOR_OPTIONS[0]);
      setSelectedChatRoomIds([]);
      setIsEditing(false);
      setShowChatroomSelector(false);
    }
  }, [open, tag, assignedRoomIds]);

  const isDuplicateTagName = useMemo(() => {
    const normalizedTagName = tagName.trim().toLowerCase();

    if (!normalizedTagName || (isEditing && normalizedTagName === tag?.name.trim().toLowerCase())) {
      return false;
    }

    return tags.some((t) => t.name.trim().toLowerCase() === normalizedTagName);
  }, [tagName, tags, tag, isEditing]);

  const [createTag, { isLoading: isCreatingTagMutationLoading }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTagMutationLoading }] = useUpdateTagMutation();
  const [assignTag, { isLoading: isAssigningTagLoading }] = useAssignTagMutation();
  const isSubmitting =
    isCreatingTagMutationLoading || isUpdatingTagMutationLoading || isAssigningTagLoading || isFetchingRoomIds;

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast.error('Tên thẻ không được để trống');
      return;
    }

    if (isDuplicateTagName) {
      toast.error('Phân loại đã tồn tại');
      return;
    }

    try {
      if (tag && isEditing) {
        await updateTag({
          tagId: tag.tagId,
          name: tagName,
          color: selectedColor,
        }).unwrap();

        await assignTag({ tagId: tag.tagId, roomIds: selectedChatRoomIds }).unwrap();

        toast.success('Cập nhật thẻ thành công');
      } else {
        const res = await createTag({ name: tagName, color: selectedColor }).unwrap();

        const createdTagId = res?.data?.tagId;

        await assignTag({ tagId: Number(createdTagId), roomIds: selectedChatRoomIds }).unwrap();

        toast.success('Tạo thẻ thành công');
      }

      setTagName('');
      setSelectedColor(COLOR_OPTIONS[0]);
      setSelectedChatRoomIds([]);
      onOpenChange(false);
      refetchTags();
    } catch (error) {
      const errorMessage =
        (error as IBackendError)?.data?.message || (tag ? 'Không thể cập nhật thẻ' : 'Không thể tạo thẻ');
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setTagName('');
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedChatRoomIds([]);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {tag ? 'Chi tiết thẻ phân loại' : 'Thêm mới thẻ phân loại'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Tên thẻ</label>
              <div className="flex gap-2 relative">
                <Input
                  placeholder="Nhập tên thẻ phân loại"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="bg-accent/50 border-0 focus-visible:ring-1 rounded-lg flex-1"
                  autoFocus
                />
                <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                  <PopoverTrigger asChild>
                    <span
                      className="rounded-lg transition-transform absolute right-2 top-[54%] -translate-y-1/2 cursor-pointer"
                      title="Chọn màu sắc"
                    >
                      <Tag className="h-5 w-5 stroke-4" style={{ color: selectedColor }} />
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit p-3">
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setIsColorPickerOpen(false);
                          }}
                          className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                            selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {isDuplicateTagName && <p className="mt-1 text-sm text-red-500">Phân loại đã tồn tại</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                Hội thoại được gán thẻ
                {isFetchingRoomIds && <Loader2 className="h-4 w-4 animate-spin" />}
              </label>
              {!showChatroomSelector ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setShowChatroomSelector(true)}
                    className="flex w-full rounded-lg cursor-pointer text-primary items-center font-bold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm hội thoại
                  </div>

                  {selectedChatRoomIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedChatRoomIds.map((roomId) => {
                        const room = chatRooms.find((item) => item.roomId === roomId);

                        if (!room) return null;

                        return (
                          <div
                            key={roomId}
                            className="flex items-center gap-2 rounded-full border bg-accent/40 px-2 py-1"
                          >
                            <Avatar className="h-6 w-6 border">
                              <AvatarImage src={room.avatar || '/placeholder.svg'} alt={room.name} />
                              <AvatarFallback className="text-[10px]">{room.name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <span className="max-w-32 truncate text-xs font-medium">{room.name}</span>
                            <div
                              onClick={() => setSelectedChatRoomIds((prev) => prev.filter((id) => id !== roomId))}
                              className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                              title="Xóa hội thoại khỏi danh sách đã chọn"
                            >
                              <X className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancel} variant="outline" className="rounded-lg" size="sm">
                Hủy
              </Button>
              <Button
                onClick={handleCreateTag}
                disabled={!tagName.trim() || isSubmitting}
                className="rounded-lg"
                size="sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : tag ? 'Cập nhật' : 'Thêm phân loại'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TagChatroomSelectorDialog
        open={showChatroomSelector}
        onClose={() => setShowChatroomSelector(false)}
        onSelectedChatRoomIdsChange={setSelectedChatRoomIds}
        selectedChatRoomIds={selectedChatRoomIds}
        onToggleChatRoom={(roomId) => {
          setSelectedChatRoomIds((current) =>
            current.includes(roomId) ? current.filter((id) => id !== roomId) : [...current, roomId],
          );
        }}
        chatRooms={chatRooms}
      />
    </>
  );
}
