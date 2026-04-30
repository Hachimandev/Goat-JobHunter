'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useGetInvitePreviewQuery, useJoinByInviteMutation } from '@/services/chatRoom/invite/inviteApi';
import { IBackendError } from '@/types/api';
import { Home, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const INVITE_TOKEN_REGEX = /^[A-Za-z0-9_-]{8,128}$/;

export default function InviteLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token?.trim();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const isValidToken = Boolean(token && INVITE_TOKEN_REGEX.test(token));
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
  } = useGetInvitePreviewQuery(token, {
    skip: !isValidToken,
  });
  const [joinByInvite, { isLoading }] = useJoinByInviteMutation();
  const preview = previewData?.data;

  const handleJoin = async () => {
    if (!isValidToken || !token) {
      toast.error('Link mời không hợp lệ');
      return;
    }
    if (!isSignedIn) {
      router.replace(`/signin?redirect=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }

    try {
      const response = await joinByInvite({ inviteToken: token }).unwrap();
      const joinStatus = response.data?.status;
      const roomId = response.data?.roomId;
      if (!roomId) {
        toast.error('Không tìm thấy phòng chat để chuyển hướng');
        return;
      }
      if (joinStatus === 'request_pending') {
        toast.success('Đã gửi yêu cầu tham gia. Vui lòng chờ quản trị viên duyệt.');
        router.replace('/messages');
        return;
      }
      router.replace(`/messages/${roomId}`);
    } catch (error) {
      toast.error((error as IBackendError).data?.message || 'Không thể tham gia nhóm');
    }
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-border p-6">
          <h1 className="text-lg font-semibold">Link mời không hợp lệ</h1>
          <p className="text-sm text-muted-foreground">Link mời phải có định dạng /invite/:token hợp lệ.</p>
          <Button type="button" className="w-full rounded-xl" asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

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
            <Image
              src={preview.roomAvatar}
              alt={preview.roomName || 'Room avatar'}
              className="h-16 w-16 rounded-full object-cover"
              width={64}
              height={64}
            />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {isPreviewError
            ? 'Link mời không còn hợp lệ, đã hết hạn, hoặc đã bị thu hồi.'
            : preview?.inviteEnabled === false
              ? 'Link mời hiện đang bị tắt.'
              : 'Nhấn nút bên dưới để tham gia nhóm chat.'}
        </p>
        {!isPreviewError && (
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
            ) : isSignedIn ? (
              'Tham gia nhóm'
            ) : (
              'Đăng nhập để tham gia'
            )}
          </Button>
        )}
        <Button type="button" variant={isPreviewError ? 'default' : 'outline'} className="w-full rounded-xl" asChild>
          <Link href="/messages">
            <Home />
            Quay lại trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
