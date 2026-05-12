export interface UserReactionInfo {
  accountId: number;
  fullName: string;
  username: string;
  avatar: string;
  reactedAt: string;
}

export interface ReactionGroupResponse {
  emoji: string;
  count: number;
  users: UserReactionInfo[];
}

export interface MessageReactionResponse {
  messageId: string;
  reactions: ReactionGroupResponse[];
}

export interface MessageReactionRequest {
  emoji: string;
}
