'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useGetInvitePreviewQuery, useJoinByInviteMutation } from '@/services/chatRoom/invite/inviteApi';
import { IBackendError } from '@/types/api';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function InviteLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { data: previewData, isLoading: isPreviewLoading, isError: isPreviewError } = useGetInvitePreviewQuery(token, {
    skip: !token,
  });
  const [joinByInvite, { isLoading }] = useJoinByInviteMutation();
  const preview = previewData?.data;

  const handleJoin = async () => {
    if (!token) {
      toast.error('Link mời không hợp lệ');
      return;
    }
    if (!isSignedIn) {
      router.replace(`/signin?redirect=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }

    try {
      const response = await joinByInvite({ inviteToken: token }).unwrap();
      const roomId = response.data?.roomId;
      if (!roomId) {
        toast.error('Không tìm thấy phòng chat để chuyển hướng');
        return;
      }
      router.replace(`/messages/${roomId}`);
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Không thể tham gia nhóm');
    }
  };

  if (isPreviewLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải thông tin lời mời...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border p-6">
        <h1 className="text-lg font-semibold">{preview?.roomName || 'Tham gia nhóm bằng link mời'}</h1>
        {preview?.roomAvatar ? (
          <div className="flex justify-center">
            <img
              src={preview.roomAvatar}
              alt={preview.roomName || 'Room avatar'}
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {isPreviewError
            ? 'Không thể tải thông tin phòng chat từ link mời.'
            : preview?.inviteEnabled === false
              ? 'Link mời hiện đang bị tắt.'
              : 'Nhấn nút bên dưới để tham gia nhóm chat.'}
        </p>
        <Button
          type="button"
          className="w-full rounded-xl"
          disabled={isLoading || (preview ? !preview.inviteEnabled : false)}
          onClick={handleJoin}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tham gia...
            </>
          ) : (
            isSignedIn ? 'Tham gia nhóm' : 'Đăng nhập để tham gia'
          )}
        </Button>
      </div>
    </div>
  );
}
