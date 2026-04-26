import { usePaginatedChatRoomAssets } from '@/app/(chat)/messages/hooks/usePaginatedChatRoomAssets';
import { ChatRoom } from '@/types/model';

interface AssetInDetailPanelProps {
  isOpen: boolean;
  chatRoom: ChatRoom;
}

const useAssetInDetailPanel = ({ isOpen, chatRoom }: AssetInDetailPanelProps) => {
  const {
    assets: media,
    isLoadingInitial: isLoadingMedia,
    isError: isErrorMedia,
    hasMore: hasMoreMedia,
    isFetchingNext: isFetchingNextMedia,
    loadMore: loadMoreMedia,
  } = usePaginatedChatRoomAssets({
    chatRoomId: chatRoom?.roomId ?? null,
    assetType: 'media',
    enabled: isOpen && Boolean(chatRoom),
  });

  const {
    assets: files,
    isLoadingInitial: isLoadingFile,
    isError: isErrorFile,
    hasMore: hasMoreFile,
    isFetchingNext: isFetchingNextFile,
    loadMore: loadMoreFile,
  } = usePaginatedChatRoomAssets({
    chatRoomId: chatRoom?.roomId ?? null,
    assetType: 'files',
    enabled: isOpen && Boolean(chatRoom),
  });

  return {
    media,
    isLoadingMedia,
    isErrorMedia,
    hasMoreMedia,
    isFetchingNextMedia,
    loadMoreMedia,

    files,
    isLoadingFile,
    isErrorFile,
    hasMoreFile,
    isFetchingNextFile,
    loadMoreFile,
  };
};

export default useAssetInDetailPanel;
