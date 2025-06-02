export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  roles: UserRole[];
  enabled: boolean;
  isOnline: boolean;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  // Statistiques
  totalMessages?: number;
  totalConnections?: number;
  lastLogin?: Date | string;
  // Paramètres
  isPrivate: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
}

export interface UserRole {
  id: number;
  name: 'USER' | 'ADMIN' | 'MODERATOR';
  description?: string;
}

export interface UserSearchFilter {
  query?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'ALL';
  status?: 'online' | 'offline' | 'all';
  enabled?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: 'username' | 'email' | 'createdAt' | 'lastLogin';
  sortDirection?: 'asc' | 'desc';
}

export interface UserConnection {
  id: number;
  user: User;
  connectedAt: Date;
  status: 'pending' | 'accepted' | 'blocked';
  isBlocked: boolean;
}

export interface UserActivity {
  id: number;
  userId: number;
  type: 'login' | 'logout' | 'message_sent' | 'profile_updated';
  description: string;
  timestamp: Date;
  metadata?: any;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
