import { CommentType } from "@/types/model";

export interface NestedComment extends CommentType {
  replies?: NestedComment[];
  level: number;
}

export const formatComments = (comments: CommentType[]): NestedComment[] => {
  if (!comments || comments.length === 0) return [];

  const commentMap = new Map<number, NestedComment>();
  const rootComments: NestedComment[] = [];
  comments.forEach((comment) => {
    commentMap.set(comment.commentId, {
      ...comment,
      replies: [],
      level: 0,
    });
  });

  comments.forEach((comment) => {
    const current = commentMap.get(comment.commentId)!;
    const parentId = comment.parent?.commentId;

    if (!parentId) {
      rootComments.push(current);
    } else {
      const parent = commentMap.get(Number(parentId));
      if (parent) {
        current.level = parent.level + 1;
        parent.replies?.push(current);
      } else {
        rootComments.push(current);
      }
    }
  });

  return rootComments;
};
