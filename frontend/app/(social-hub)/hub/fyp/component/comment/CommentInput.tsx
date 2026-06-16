import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';
import useCommentActions from '@/hooks/useCommentActions';
import { isCompanyResponse } from '@/utils/slug';
import { MeResponse, CompanyResponse, ApplicantResponse, RecruiterResponse } from '@/types/dto';

interface CommentInputProps {
  replyTo?: {
    commentId: number;
    authorName: string;
  };
  onCancelReply?: () => void;
}

export default function CommentInput({ replyTo, onCancelReply }: Readonly<CommentInputProps>) {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const { blog } = useAppSelector((state) => state.blogDetail);
  const { handleCommentBlog, handleReplyComment, isCommenting } = useCommentActions();

  const handleSend = async () => {
    if (!blog) {
      toast.error('Không tìm thấy bài viết để bình luận.');
      return;
    }

    if (!input.trim()) {
      toast.info('Vui lòng nhập nội dung bình luận.');
      return;
    }

    if (replyTo) {
      // Đây là reply comment
      await handleReplyComment(Number(blog.blogId), replyTo.commentId, input);

      if (onCancelReply) {
        onCancelReply();
      }
    } else {
      // Đây là comment vào blog
      await handleCommentBlog(Number(blog.blogId), input);
    }

    setInput('');
  };

  // Get display name based on user type
  const getDisplayName = (userData: typeof user): string => {
    if (!userData) return 'User';
    if (isCompanyResponse(userData as MeResponse)) {
      return (userData as CompanyResponse).name;
    }
    return (
      (userData as ApplicantResponse | RecruiterResponse)?.fullName ||
      (userData as ApplicantResponse | RecruiterResponse)?.username ||
      'User'
    );
  };

  const placeholder = replyTo ? `Trả lời ${replyTo.authorName}...` : `Bình luận với tên ${getDisplayName(user)}...`;

  return (
    <div className="w-full flex items-start gap-2">
      <Textarea
        className="rounded-xl resize-none max-h-24 overflow-y-auto"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={isCommenting}
      />
      <Button className="rounded-xl" size="icon" onClick={handleSend} disabled={isCommenting || !input.trim()}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
