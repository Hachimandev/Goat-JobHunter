'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLazyGetMyFriendshipsQuery } from '@/services/friendship/friendshipApi';
import type { MyFriendResponse } from '@/services/friendship/friendshipType';
import { getFriendUserDisplayName } from '@/utils/friendshipUtils';
import debounce from 'lodash/debounce';
import { Loader2, Search, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type FriendRecipient = {
  accountId: number;
  displayName: string;
  username?: string;
  avatar?: string;
};

interface BusinessCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedUserIds: number[]) => void | Promise<void>;
}

const SEARCH_DEBOUNCE_MS = 500;
const FRIENDS_PAGE_SIZE = 50;

const mapFriendResponseToRecipient = (item: MyFriendResponse): FriendRecipient | null => {
  const friend = item.friend;

  if (!friend || typeof friend.accountId !== 'number' || friend.accountId <= 0) {
    return null;
  }

  return {
    accountId: friend.accountId,
    displayName: getFriendUserDisplayName(friend, 'Người dùng'),
    username: friend.username,
    avatar: friend.avatar,
  };
};

export function BusinessCardModal({ open, onOpenChange, onSubmit }: Readonly<BusinessCardModalProps>) {
  const [keyword, setKeyword] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<FriendRecipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [triggerGetMyFriendships, { data: friendshipsResponse, isFetching, isError }] = useLazyGetMyFriendshipsQuery();

  const friendRecipients = useMemo(() => {
    const records = friendshipsResponse?.data?.result ?? [];

    return records
      .map((item) => mapFriendResponseToRecipient(item))
      .filter((item): item is FriendRecipient => item !== null);
  }, [friendshipsResponse]);

  const selectedRecipientIds = useMemo(
    () => new Set(selectedRecipients.map((recipient) => recipient.accountId)),
    [selectedRecipients],
  );

  const resetModalState = useCallback(() => {
    setKeyword('');
    setSelectedRecipients([]);
    setIsSubmitting(false);
  }, []);

  const fetchFriendships = useCallback(
    (searchTerm: string) => {
      void triggerGetMyFriendships({
        page: 1,
        size: FRIENDS_PAGE_SIZE,
        searchTerm: searchTerm.trim(),
      });
    },
    [triggerGetMyFriendships],
  );

  const debouncedFetchFriendships = useMemo(
    () => debounce((searchTerm: string) => fetchFriendships(searchTerm), SEARCH_DEBOUNCE_MS),
    [fetchFriendships],
  );

  useEffect(() => {
    return () => {
      debouncedFetchFriendships.cancel();
    };
  }, [debouncedFetchFriendships]);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchFriendships('');
  }, [fetchFriendships, open]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      debouncedFetchFriendships.cancel();
      resetModalState();
    }

    onOpenChange(nextOpen);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    debouncedFetchFriendships(value);
  };

  const toggleRecipientSelection = (recipient: FriendRecipient) => {
    if (isSubmitting) {
      return;
    }

    setSelectedRecipients((prev) => {
      const isSelected = prev.some((item) => item.accountId === recipient.accountId);

      if (isSelected) {
        return prev.filter((item) => item.accountId !== recipient.accountId);
      }

      return [...prev, recipient];
    });
  };

  const handleRemoveRecipient = (accountId: number) => {
    setSelectedRecipients((prev) => prev.filter((recipient) => recipient.accountId !== accountId));
  };

  const handleCancel = () => {
    handleDialogOpenChange(false);
  };

  const handleSubmit = async () => {
    if (selectedRecipients.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(selectedRecipients.map((recipient) => recipient.accountId));
      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmptyResults = !isFetching && !isError && friendRecipients.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl">
        <DialogHeader>
          <DialogTitle>Gửi danh thiếp</DialogTitle>
          <DialogDescription>Chọn bạn bè để gửi danh thiếp.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => handleKeywordChange(event.target.value)}
              placeholder="Tìm bạn bè theo tên..."
              className="pl-9 rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          {selectedRecipients.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-2">
              {selectedRecipients.map((recipient) => (
                <Badge
                  key={recipient.accountId}
                  variant="outline"
                  className="inline-flex max-w-full items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={recipient.avatar || '/placeholder.svg'} alt={recipient.displayName} />
                    <AvatarFallback className="text-[10px]">
                      {recipient.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-40 truncate">{recipient.displayName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(recipient.accountId)}
                    className="inline-flex"
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <ScrollArea className="h-[300px] rounded-xl border">
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-destructive">Không thể tải danh sách bạn bè</div>
            ) : isEmptyResults ? (
              <div className="py-8 text-center text-muted-foreground">
                {keyword.trim().length > 0 ? 'Không tìm thấy bạn bè phù hợp' : 'Bạn chưa có bạn bè nào'}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {friendRecipients.map((recipient) => {
                  const isSelected = selectedRecipientIds.has(recipient.accountId);

                  return (
                    <button
                      key={recipient.accountId}
                      type="button"
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-colors',
                        'flex items-center gap-3',
                        isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent/50',
                      )}
                      onClick={() => toggleRecipientSelection(recipient)}
                      disabled={isSubmitting}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none shrink-0" />

                      <Avatar className="h-10 w-10 border shrink-0">
                        <AvatarImage src={recipient.avatar || '/placeholder.svg'} alt={recipient.displayName} />
                        <AvatarFallback>
                          <UserRound className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{recipient.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {recipient.username ?? 'Không có username'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => void handleSubmit()}
              disabled={selectedRecipients.length === 0 || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedRecipients.length > 0 ? `Gửi (${selectedRecipients.length})` : 'Gửi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
