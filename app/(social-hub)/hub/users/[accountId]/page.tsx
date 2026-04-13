'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoaderSpin from '@/components/common/LoaderSpin';
import { useGetMyAccountQuery } from '@/services/auth/authApi';
import { useFetchUserByIdQuery } from '@/services/user/userApi';
import { ProfileHeader } from '@/app/(social-hub)/hub/profile/components/ProfileHeader';
import { ProfileInfo } from '@/app/(social-hub)/hub/profile/components/ProfileInfo';
import FriendActionButtons from '@/components/common/FriendActionButtons';
import { SocialBlogCard } from '@/app/(social-hub)/hub/fyp/component/SocialBlogCard';
import { useInfiniteScrollUserBlogs } from '@/app/(social-hub)/hub/users/hooks/useInfiniteScrollUserBlogs';
import { useUser } from '@/hooks/useUser';

export default function UserProfilePage() {
  const router = useRouter();
  const { isLoading: isLoadingMyAccount, isFetching: isFetchingMyAccount } = useGetMyAccountQuery();
  const { user: currentUser, isSignedIn } = useUser();
  const isAuthResolved = !isLoadingMyAccount && !isFetchingMyAccount;

  useEffect(() => {
    if (isAuthResolved && !isSignedIn) {
      router.replace('/signin');
    }
  }, [isAuthResolved, isSignedIn, router]);

  const params = useParams<{ accountId: string }>();
  const accountIdParam = params?.accountId;
  const accountId = Number(accountIdParam);
  const isValidAccountId = Number.isFinite(accountId) && accountId > 0;

  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useFetchUserByIdQuery(accountIdParam || '', {
    skip: !isAuthResolved || !isSignedIn || !accountIdParam || !isValidAccountId,
  });

  const { blogs, isLoading, isError, isFetching, isSuccess, hasMore, savedBlogIds, reactedBlogIds, targetRef } =
    useInfiniteScrollUserBlogs(accountId, { enabled: isAuthResolved && isSignedIn });
  const viewedUser = userResponse?.data;

  const isOwnProfile = useMemo(() => {
    if (!currentUser || !viewedUser) return false;
    return currentUser.accountId === viewedUser.accountId;
  }, [currentUser, viewedUser]);

  if (!isValidAccountId) {
    return <ErrorMessage message="ID tài khoản không hợp lệ." />;
  }

  if (!isAuthResolved || !isSignedIn) {
    return <LoaderSpin />;
  }

  if (isLoadingUser) {
    return <LoaderSpin />;
  }

  if (isUserError || !viewedUser) {
    return <ErrorMessage message="Không tìm thấy người dùng hoặc bạn không có quyền truy cập." />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden p-4 mb-4">
        <ProfileHeader user={viewedUser} />
        {!isOwnProfile && (
          <div className="mt-20 mb-4">
            <FriendActionButtons targetUserId={viewedUser.accountId} showBlockActions />
          </div>
        )}
        <ProfileInfo user={viewedUser} hideSensitiveContact={!isOwnProfile} />
      </div>

      {isError && <ErrorMessage message={'Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.'} />}

      {isLoading && <LoaderSpin />}

      {isSuccess && (
        <>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <SocialBlogCard
                key={blog.blogId}
                blog={blog}
                isSaved={savedBlogIds.find((b) => b.blogId === blog.blogId)?.result || false}
                initialReaction={reactedBlogIds.find((b) => b.blogId === blog.blogId)?.reactionType || null}
                owned={isOwnProfile}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={targetRef} className="py-8 flex justify-center">
              {isFetching && <LoaderSpin />}
            </div>
          )}

          {!hasMore && blogs.length > 0 && (
            <p className="text-center text-muted-foreground py-8">Bạn đã xem hết tất cả bài viết</p>
          )}
        </>
      )}
    </div>
  );
}
