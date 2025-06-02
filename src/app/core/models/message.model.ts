export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  encryptedContent?: string;
  timestamp: Date;
  status: MessageStatus;
}
