import React from "react";
import { Blog } from "@/types/model";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useBlogActions from "@/hooks/useBlogActions";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import RichTextPreview from "@/components/RichText/Preview";
import { truncate } from "lodash";
import { extractPlainTextFromHtml } from "@/utils/extractPlainTextFromHtml";

interface SavedBlogCardProps {
  blog: Blog;
}

const SavedBlogCard: React.FC<SavedBlogCardProps> = ({ blog }) => {
  const { handleToggleSaveBlog, isUnsaving } = useBlogActions();

  const timeAgo = formatDistanceToNow(new Date(blog.createdAt), {
    addSuffix: true,
    locale: vi
  });

  const handleUnsave = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleToggleSaveBlog(e, blog.blogId, true);
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="">
        <div className="flex gap-4">
          <div className="w-1/4">
            {blog.images?.[0] && (
              <Link href={`/hub/blog/${blog.blogId}`} className="flex-shrink-0">
                <Image
                  src={blog.images[0]}
                  alt="Blog thumbnail"
                  className="h-full object-cover aspect-square border rounded-lg"
                  width={512}
                  height={512}
                />
              </Link>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link href={`/hub/blog/${blog.blogId}`}>
              <RichTextPreview
                content={truncate(extractPlainTextFromHtml(blog.content), {length: 80})}
                className="font-semibold line-clamp-2 hover:underline"
              />
            </Link>

            <p className="text-sm text-muted-foreground mt-1">
              {timeAgo}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6 border">
                <AvatarImage src={blog.author.avatar} />
                <AvatarFallback>
                  {blog.author.fullName[0] || blog.author.username[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Saved from {blog.author.fullName || blog.author.username}&apos;s post
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleUnsave}
                disabled={isUnsaving}
                title="Bỏ lưu bài viết"
              >
                <BookmarkX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedBlogCard;