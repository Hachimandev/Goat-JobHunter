import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatRoom } from '@/types/model';
import { SharedMediaGrid } from './SharedMediaGrid';
import { SharedFilesList } from './SharedFilesList';
import useAssetInDetailPanel from '@/app/(chat)/messages/hooks/useAssetInDetailPanel';

interface AssetTabSectionProps {
  isDetailPanelOpen: boolean;
  chatRoom: ChatRoom;
}

const AssetTabSection = ({ isDetailPanelOpen, chatRoom }: AssetTabSectionProps) => {
  const {
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
  } = useAssetInDetailPanel({ isOpen: isDetailPanelOpen, chatRoom });

  return (
    <Tabs defaultValue="media" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger className="cursor-pointer" value="media">
          Phương tiện
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="files">
          Files
        </TabsTrigger>
      </TabsList>
      <TabsContent value="media" className="mt-4">
        <SharedMediaGrid
          media={media}
          isLoading={isLoadingMedia}
          isError={isErrorMedia}
          hasMore={hasMoreMedia}
          isFetchingNext={isFetchingNextMedia}
          onLoadMore={loadMoreMedia}
        />
      </TabsContent>
      <TabsContent value="files" className="mt-4">
        <SharedFilesList
          files={files}
          isLoading={isLoadingFile}
          isError={isErrorFile}
          hasMore={hasMoreFile}
          isFetchingNext={isFetchingNextFile}
          onLoadMore={loadMoreFile}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AssetTabSection;
