import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

const CommentAvatar = ({ src, alt, fallback, className }: Props) => {
  return (
    <Avatar className={cn("h-12 w-12 flex-shrink-0 border-2", className)}>
      <AvatarImage src={src || "/placeholder.svg"} alt={alt || `Current User`} />
      <AvatarFallback>{fallback || "U"}</AvatarFallback>
    </Avatar>
  );
};
export default CommentAvatar;
