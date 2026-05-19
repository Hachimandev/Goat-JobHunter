import { useEffect, useRef, useState } from 'react';
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

  const [activeTab, setActiveTab] = useState<'media' | 'files'>('media');
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaBtnRef = useRef<HTMLButtonElement | null>(null);
  const filesBtnRef = useRef<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      const container = tabsContainerRef.current;
      const activeBtn = activeTab === 'media' ? mediaBtnRef.current : filesBtnRef.current;
      if (!container || !activeBtn) return;

      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      setIndicatorStyle({
        left: btnRect.left - containerRect.left + container.scrollLeft,
        width: btnRect.width,
      });
    };

    requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, media?.length, files?.length]);

  return (
    <div className="w-full">
      <div ref={tabsContainerRef} className="relative w-full">
        <div className="flex items-center gap-2">
          <button
            ref={mediaBtnRef}
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1 cursor-pointer font-bold transition-colors ${
              activeTab === 'media' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Phương tiện
          </button>
          <button
            ref={filesBtnRef}
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1 cursor-pointer font-bold transition-colors ${
              activeTab === 'files' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Files
          </button>
        </div>

        <div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-200"
          style={{ left: indicatorStyle.left + 'px', width: indicatorStyle.width + 'px' }}
        />
      </div>

      <div className="mt-4">
        {activeTab === 'media' ? (
          <SharedMediaGrid
            media={media}
            isLoading={isLoadingMedia}
            isError={isErrorMedia}
            hasMore={hasMoreMedia}
            isFetchingNext={isFetchingNextMedia}
            onLoadMore={loadMoreMedia}
          />
        ) : (
          <SharedFilesList
            files={files}
            isLoading={isLoadingFile}
            isError={isErrorFile}
            hasMore={hasMoreFile}
            isFetchingNext={isFetchingNextFile}
            onLoadMore={loadMoreFile}
          />
        )}
      </div>
    </div>
  );
};

export default AssetTabSection;
