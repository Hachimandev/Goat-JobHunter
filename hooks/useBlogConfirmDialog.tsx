import { useMemo, useState } from 'react';

export type BlogActionType = 'enable' | 'disable' | 'delete' | null;

interface UseBlogConfirmDialogProps {
  onConfirm: (actionType: BlogActionType, ids: number[], reason?: string) => Promise<void>;
  isDeleting?: boolean;
  isEnabling?: boolean;
  isDisabling?: boolean;
}

export const useBlogConfirmDialog = ({
  onConfirm,
  isDeleting = false,
  isEnabling = false,
  isDisabling = false,
}: UseBlogConfirmDialogProps) => {
  const [actionType, setActionType] = useState<BlogActionType>(null);
  const [targetIds, setTargetIds] = useState<number[]>([]);
  const [targetTitle, setTargetTitle] = useState<string>('');

  const openDialog = (type: BlogActionType, ids: number[], title?: string) => {
    setActionType(type);
    setTargetIds(ids);
    setTargetTitle(title || '');
  };

  const closeDialog = () => {
    setActionType(null);
    setTargetIds([]);
    setTargetTitle('');
  };

  const handleConfirm = async (reason?: string) => {
    try {
      await onConfirm(actionType, targetIds, reason);
      closeDialog();
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  const dialogConfig = useMemo(() => {
    const count = targetIds.length;

    if (actionType === 'delete') {
      return {
        title: 'Xóa bài viết?',
        description: targetTitle ? (
          <>
            Hành động này không thể hoàn tác. Bài viết{' '}
            <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ bị xóa vĩnh viễn.
          </>
        ) : (
          <>Hành động này không thể hoàn tác. {count} bài viết sẽ bị xóa vĩnh viễn.</>
        ),
        confirmText: 'Xóa bài viết',
        confirmBtnClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white',
      };
    }

    if (actionType === 'enable') {
      return {
        title: 'Hiển thị bài viết?',
        description: targetTitle ? (
          <>
            Bài viết <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ được công khai trở
            lại.
          </>
        ) : (
          <>{count} bài viết sẽ được công khai trở lại.</>
        ),
        confirmText: 'Hiển thị',
        confirmBtnClass: 'bg-green-600 text-white hover:bg-green-700',
      };
    }

    if (actionType === 'disable') {
      return {
        title: 'Ẩn bài viết?',
        description: targetTitle ? (
          <>
            Bài viết <span className="font-bold text-foreground">&quot;{targetTitle}&quot;</span> sẽ bị ẩn khỏi trang
            công khai.
          </>
        ) : (
          <>{count} bài viết sẽ bị ẩn khỏi trang công khai.</>
        ),
        confirmText: 'Ẩn bài viết',
        confirmBtnClass: 'bg-orange-600 text-white hover:bg-orange-700',
      };
    }

    return { title: '', description: null };
  }, [actionType, targetIds.length, targetTitle]);

  return {
    actionType,
    dialogConfig,
    openDialog,
    closeDialog,
    handleConfirm,
    isLoading: isDeleting || isEnabling || isDisabling,
  };
};
