import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bookmark, Flag } from 'lucide-react';
import { Blog } from '@/types/model';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { UserHoverCard } from '@/app/(social-hub)/hub/fyp/component/UserHoverCard';
import Link from 'next/link';
import { RowsPhotoAlbum } from 'react-photo-album';
import { RenderBlogImage } from '@/components/common/Photo/RenderNextImage';
import { useMemo, useState } from 'react';
import RichTextPreview from '@/components/RichText/Preview';
import formatImageUrlsForPhotoView from '@/utils/formatImageUrlsForPhotoView';
import { useAppDispatch } from '@/lib/hooks';
import { openBlogDetail } from '@/lib/features/blogDetailSlice';
import BlogActivity from '@/app/(social-hub)/hub/fyp/component/BlogActivity';
import useBlogActions from '@/hooks/useBlogActions';
import ReportTicketDialog from '@/components/management/blogs/ReportTicketDialog';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

const BLOG_CONTENT_PREVIEW_LENGTH = 280;

interface SocialBlogCardProps {
  blog: Blog;
  isSaved: boolean;
  initialReaction: string | null;
  owned?: boolean;
}

export function SocialBlogCard({ blog, isSaved, initialReaction, owned = false }: Readonly<SocialBlogCardProps>) {
  const dispatch = useAppDispatch();
  const { handleToggleSaveBlog, isLoading } = useBlogActions();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const { isSignedIn, user } = useUser();

  const timeAgo = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  const formattedImageUrls = useMemo(() => formatImageUrlsForPhotoView(blog?.images), [blog?.images]);
  const plainContent = useMemo(() => extractPlainTextFromHtml(blog.content).trim(), [blog.content]);
  const shouldShowReadMore = plainContent.length > BLOG_CONTENT_PREVIEW_LENGTH;
  const shortContent = useMemo(() => {
    if (!shouldShowReadMore) return plainContent;
    return `${plainContent.slice(0, BLOG_CONTENT_PREVIEW_LENGTH).trimEnd()}...`;
  }, [plainContent, shouldShowReadMore]);

  const handleOpenDetail = () => {
    dispatch(openBlogDetail(blog));
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    await handleToggleSaveBlog(e, blog.blogId, isSaved);
  };

  const handleReportClick = () => {
    if (!isSignedIn || !user) {
      toast.error('Bạn phải đăng nhập để thực hiện chức năng này.');
      return;
    }

    localStorage.setItem('selectedReportItem', blog.blogId.toString());
    localStorage.setItem('selectedReportType', 'blog');
    setIsReportModalOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden border border-border bg-card py-0 gap-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={blog.author.avatar} alt={blog.author.fullName} />
              <AvatarFallback>{blog.author.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <UserHoverCard
                userId={blog.author.accountId}
                fullName={blog.author.fullName}
                avatar={blog.author.avatar}
                username={blog.author.username}
                bio={blog.author.bio}
              >
                <Link
                  href={`/hub/users/${blog.author.accountId}`}
                  className="text-sm font-semibold hover:underline cursor-pointer"
                >
                  {blog.author.fullName}
                </Link>
              </UserHoverCard>
              <div className="text-xs text-muted-foreground">{timeAgo}</div>
            </div>
            {!owned && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  title="Lưu bài viết"
                  onClick={handleSaveClick}
                  disabled={isLoading}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'fill-white text-foreground'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  title="Báo cáo bài viết"
                  onClick={handleReportClick}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {isContentExpanded || !shouldShowReadMore ? (
            <RichTextPreview content={blog.content} className="mb-3 text-sm" />
          ) : (
            <p className="mb-2 text-sm whitespace-pre-line">{shortContent}</p>
          )}
          {shouldShowReadMore && (
            <Button
              type="button"
              variant="link"
              className="mb-3 h-auto p-0 text-sm font-semibold"
              onClick={() => setIsContentExpanded((prev) => !prev)}
            >
              {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
          )}

          {blog.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge key={index + tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {formattedImageUrls.length > 0 && (
          <div className="border-t">
            <RowsPhotoAlbum photos={formattedImageUrls} render={{ image: RenderBlogImage }} spacing={0} />
          </div>
        )}

        <BlogActivity blog={blog} onCommentClick={handleOpenDetail} initialReaction={initialReaction} />
      </Card>
      <ReportTicketDialog isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </>
  );
}
