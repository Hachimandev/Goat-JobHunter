'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useJoinByInviteMutation } from '@/services/chatRoom/invite/inviteApi';
import { IBackendError } from '@/types/api';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function InviteLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [joinByInvite, { isLoading }] = useJoinByInviteMutation();

  useEffect(() => {
    if (isSignedIn || !token) {
      return;
    }

    router.replace(`/signin?redirect=${encodeURIComponent(`/invite/${token}`)}`);
  }, [isSignedIn, router, token]);

  const handleJoin = async () => {
    if (!token) {
      toast.error('Link mời không hợp lệ');
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

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang chuyển đến trang đăng nhập...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border p-6">
        <h1 className="text-lg font-semibold">Tham gia nhóm bằng link mời</h1>
        <p className="text-sm text-muted-foreground">Nhấn nút bên dưới để tham gia nhóm chat.</p>
        <Button type="button" className="w-full rounded-xl" disabled={isLoading} onClick={handleJoin}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tham gia...
            </>
          ) : (
            'Tham gia nhóm'
          )}
        </Button>
      </div>
    </div>
  );
}
