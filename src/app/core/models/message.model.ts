export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export enum EncryptionStatus {
  OK = 'OK',                // Chiffrement/déchiffrement réussi
  ERROR = 'ERROR',          // Erreur générique
  TAMPERED = 'TAMPERED',    // Message altéré ou clé incorrecte
  INVALID = 'INVALID',      // Format de message non valide
  MISSING_KEY = 'MISSING_KEY' // Clé utilisateur manquante
}

export interface Message {
  id: number;
  conversationId?: number; // Added conversationId as optional
  senderId: number;
  receiverId: number;
  content: string;
  encryptedContent?: string;
  initializationVector?: string; // IV utilisé pour le chiffrement
  encryptionStatus?: EncryptionStatus; // Statut du chiffrement/déchiffrement
  timestamp: Date;
  status: MessageStatus;
}
