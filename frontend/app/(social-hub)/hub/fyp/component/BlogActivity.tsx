import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle } from 'lucide-react';
import { Blog } from '@/types/model';
import { cn } from '@/lib/utils';
import { ReactionButton } from '@/app/(social-hub)/hub/fyp/component/ReactionButton';
import useReactionActions from '@/hooks/useReactionActions';
import { ReactionType } from '@/types/enum';

interface BlogActivityProps {
  blog: Blog;
  initialReaction: string | null;
  onCommentClick?: () => void;
  className?: string;
}

const BlogActivity = ({ blog, onCommentClick, initialReaction, className }: BlogActivityProps) => {
  const { handleReactBlog, handleUnreactBlog } = useReactionActions();

  const handleReactionChange = (reactionId: string | null) => {
    if (reactionId) {
      return handleReactBlog(blog.blogId, reactionId as ReactionType);
    }
    return handleUnreactBlog(blog.blogId);
  };

  return (
    <div className={cn('flex items-center justify-between px-4 py-3', className)}>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <ReactionButton
          totalReactions={blog.activity?.totalLikes || 0}
          onReactionChange={handleReactionChange}
          initialReaction={initialReaction}
        />
        <Button variant="ghost" size="icon" className="flex items-center rounded-full gap-1" onClick={onCommentClick}>
          <MessageCircle className="h-4 w-4" />
          <span>{blog.activity?.totalComments || 0}</span>
        </Button>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>{blog.activity?.totalReads || 0} lượt xem</span>
      </div>
    </div>
  );
};
export default BlogActivity;
