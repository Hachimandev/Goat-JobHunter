export interface User {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member';
  online: boolean;
  joinedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: GroupMember[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  user?: User;
  group?: Group;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export interface SharedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  timestamp: Date;
}

export interface SharedLink {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  timestamp: Date;
}

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  timestamp: Date;
}