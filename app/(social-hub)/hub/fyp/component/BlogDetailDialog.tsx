"use client";

import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { UserHoverCard } from "./UserHoverCard";
import Link from "next/link";
import RichTextPreview from "@/components/RichText/Preview";
import { RowsPhotoAlbum } from "react-photo-album";
import { RenderBlogImage } from "@/components/common/Photo/RenderNextImage";
import { useMemo } from "react";
import formatImageUrlsForPhotoView from "@/utils/formatImageUrlsForPhotoView";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeBlogDetail } from "@/lib/features/blogDetailSlice";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import BlogActivity from "@/app/(social-hub)/hub/fyp/component/BlogActivity";
import { useUser } from "@/hooks/useUser";
import { useGetCommentsByBlogIdQuery } from "@/services/blog/blogApi";
import { formatCommentsToNested, NestedComment } from "@/app/(social-hub)/hub/fyp/component/comment/utils/formatComments";
import CommentInput from "@/app/(social-hub)/hub/fyp/component/comment/CommentInput";
import CommentSection from "@/app/(social-hub)/hub/fyp/component/comment/CommentSection";

export function BlogDetailDialog() {
  const dispatch = useAppDispatch();
  const { user, isSignedIn } = useUser();
  const { blog, open } = useAppSelector((state) => state.blogDetail);

  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isError: isLoadCommentsFailed
  } = useGetCommentsByBlogIdQuery(blog?.blogId || -1, {
    skip: !blog
  });

  const comments: NestedComment[] = useMemo(() => {
    if (!commentsData?.data) return []

    const rawComments = Array.isArray(commentsData.data)
      ? commentsData.data
      : [commentsData.data];

    return formatCommentsToNested(rawComments)
  }, [commentsData]);

  const handleClose = () => {
    dispatch(closeBlogDetail());
  };

  const formattedImageUrls = useMemo(
    () => formatImageUrlsForPhotoView(blog?.images),
    [blog?.images]
  );

  if (!blog || !open) return null;

  const timeAgo = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
    locale: vi
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <VisuallyHidden>
        <DialogTitle />
      </VisuallyHidden>
      <DialogContent className="max-w-4xl! p-0 pb-4 gap-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={blog.author.avatar} alt={blog.author.fullName} />
                <AvatarFallback>{blog.author.fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
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
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="p-4">
              <RichTextPreview content={blog.content} className="mb-4" />

              {blog.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index + tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {formattedImageUrls.length > 0 && (
                <div className="mb-2 border">
                  <RowsPhotoAlbum
                    photos={formattedImageUrls}
                    render={{ image: RenderBlogImage }}
                    spacing={0}
                  />
                </div>
              )}

              <BlogActivity
                blog={blog}
                className="p-0 my-2"
                initialReaction={null}
              />

              <div className="space-y-4">
                <h3 className="font-semibold">
                  Tất cả bình luận
                </h3>
                {comments && comments.length > 0 &&
                  <CommentSection
                    comments={comments}
                    isLoading={isLoadingComments}
                    isError={isLoadCommentsFailed}
                  />
                }
                {(!comments || comments.length === 0) &&
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Chưa có bình luận nào
                  </p>
                }
              </div>
            </div>
          </ScrollArea>
        </div>
        {isSignedIn && user &&
          <DialogFooter className="px-4 pt-4 border-t">
            <CommentInput />
          </DialogFooter>
        }
      </DialogContent>
    </Dialog>
  );
}