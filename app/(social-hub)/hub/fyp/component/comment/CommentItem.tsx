import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/utils/formatDate';
import { CornerDownRight, Flag, Send, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NestedComment } from '@/app/(social-hub)/hub/fyp/component/comment/utils/formatComments';
import { useUser } from '@/hooks/useUser';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useCommentActions from '@/hooks/useCommentActions';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib/hooks';
import ReportTicketDialog from '@/components/management/blogs/ReportTicketDialog';

interface CommentItemProps {
  comment: NestedComment;
}

export default function CommentItem({ comment }: Readonly<CommentItemProps>) {
  const { user, isSignedIn } = useUser();
  const { blog } = useAppSelector((state) => state.blogDetail);
  const { handleReplyComment, handleDeleteComment, isCommenting } = useCommentActions();

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const marginClass = useMemo(() => {
    if (comment.level === 0) return '';
    if (comment.level <= 2) return 'ml-12';
    return '';
  }, [comment.level]);

  const author = useMemo(() => {
    return comment.commentedBy.username || 'Người dùng ẩn danh';
  }, [comment.commentedBy]);

  const replyTo = useMemo(() => {
    return comment.parent?.commentedBy.username || 'Người dùng ẩn danh';
  }, [comment.parent?.commentedBy]);

  const handleReply = async () => {
    if (!blog) {
      toast.error('Không tìm thấy bài viết.');
      return;
    }

    if (!replyContent.trim()) {
      toast.info('Vui lòng nhập nội dung trả lời.');
      return;
    }

    await handleReplyComment(Number(blog.blogId), comment.commentId, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleDelete = async () => {
    if (!blog) {
      toast.error('Không tìm thấy bài viết để xóa bình luận.');
      return;
    }
    await handleDeleteComment({ commentId: comment.commentId, blogId: blog.blogId });
    setIsDeleteOpen(false);
  };

  const handleReportClick = () => {
    if (!isSignedIn || !user) {
      toast.error('Bạn cần đăng nhập để báo cáo bình luận.');
      return;
    }
    localStorage.setItem('selectedReportItem', comment.commentId.toString());
    localStorage.setItem('selectedReportType', 'comment');
    setIsReportOpen(true);
  };

  return (
    <>
      <div className={`space-y-3 ${marginClass}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.commentedBy.avatar || '/placeholder.svg'} alt={author} />
            <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm truncate">{author}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {comment.createdAt ? formatDateTime(comment.createdAt) : '-'}
                </p>
              </div>

              {comment.parent && (
                <p className="text-xs text-primary mb-1">
                  <span className="font-light">Trả lời </span>
                  <span className="font-semibold">{replyTo}</span>
                </p>
              )}

              <p className="text-sm break-words">{comment.comment}</p>
            </div>

            <div className="flex items-center justify-between mt-1 ml-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <CornerDownRight className="h-3 w-3 mr-1" />
                  Trả lời
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-muted-foreground hover:text-red-600 transition-colors"
                  title="Báo cáo bình luận"
                  onClick={handleReportClick}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Báo cáo
                </Button>
              </div>

              {user && user.accountId === comment.commentedBy.accountId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {isReplying && (
              <div className="mt-3 ml-3">
                <div className="mb-2 flex items-center justify-between bg-primary/5 p-2 rounded-lg">
                  <span className="text-xs text-muted-foreground">Đang trả lời {author}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Viết trả lời..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-16 max-h-24 overflow-y-auto rounded-xl resize-none text-sm"
                    rows={2}
                    disabled={isCommenting}
                  />
                  <Button
                    className="rounded-xl"
                    size="icon"
                    onClick={handleReply}
                    disabled={!replyContent.trim() || isCommenting}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.commentId} comment={reply} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa bình luận?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmBtnClass="bg-destructive text-white"
        onConfirm={handleDelete}
      />
      <ReportTicketDialog isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  );
}
