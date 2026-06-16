// Request Type
import { ReactionType } from "@/types/enum";
import { IBackendRes } from "@/types/api";

export type ReactionBlogRequest = {
  blogId: number;
  reactionType: ReactionType;
};

export type BlogIdsRequest = {
  blogIds: number[];
};

// Response Type
export type CheckReactionBlogResponse = IBackendRes<{
  blogId: number;
  reactionType: ReactionType;
}[]>