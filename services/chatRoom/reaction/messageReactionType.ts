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

export interface ReactionUpdateEvent {
  type: 'REACTION_UPDATE';
  messageId: string;
  emoji: string;
  action: 'ADDED' | 'REMOVED' | 'REPLACED';
  user: UserReactionInfo;
  previousEmoji?: string;
  totalCount: number;
}

export interface MessageReactionRequest {
  emoji: string;
}
