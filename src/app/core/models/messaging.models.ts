export interface Message {
  id: number;
  content: string;
  senderId: number;
  recipientId: number;
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  messageType: 'text' | 'image' | 'file' | 'system';
  replyTo?: number;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: number;
  timestamp: Date;
}

export interface Conversation {
  id: number;
  participant: UserInfo;
  lastMessage?: Message;
  unreadCount: number;
  totalMessages: number;
  isBlocked: boolean;
  isPinned: boolean;
  isMuted: boolean;
  lastActivity: Date;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status: 'online' | 'away' | 'busy' | 'offline';
  isTyping?: boolean;
}

export interface TypingIndicator {
  userId: number;
  conversationId: number;
  timestamp: Date;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  highlightedContent: string;
}

export interface SendMessageRequest {
  recipientId: number;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  replyTo?: number;
}
