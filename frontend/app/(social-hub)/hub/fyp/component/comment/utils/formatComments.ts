import type { CommentType } from "@/types/model";

export interface NestedComment extends CommentType {
  replies?: NestedComment[];
  level: number;
}

export const formatCommentsToNested = (
  comments: CommentType[]
): NestedComment[] => {
  if (!comments || comments.length === 0) return [];

  const commentMap = new Map<number, NestedComment>();
  const rootComments: NestedComment[] = [];

  // First pass: create all comment objects
  comments.forEach((comment) => {
    commentMap.set(comment.commentId, {
      ...comment,
      replies: [],
      level: 0
    });
  });

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const currentComment = commentMap.get(comment.commentId)!;

    if (!comment.reply || !comment.parent) {
      rootComments.push(currentComment);
    } else {
      const parentComment = commentMap.get(
        Number(comment.parent.commentId)
      );

      if (parentComment) {
        // Keep actual level without max limit
        currentComment.level = parentComment.level + 1;

        // Fallback for replies array if undefined
        parentComment.replies ??= [];

        // Add current comment to parent's replies
        parentComment.replies.push(currentComment);
      } else {
        rootComments.push(currentComment);
      }
    }
  });

  return rootComments;
};