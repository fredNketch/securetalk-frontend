import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  activeConversations: number;
  onlineUsers: number;
  messagesSent: number;
  messagesReceived: number;
}

export interface RecentActivity {
  id: number;
  type: 'message' | 'user_joined' | 'user_left' | 'admin_action';
  description: string;
  timestamp: Date;
  user: string;
  avatar?: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  badge?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  getStats(): Observable<DashboardStats> {
    // Simulation de données
    const mockStats: DashboardStats = {
      totalMessages: 1247,
      unreadMessages: 12,
      activeConversations: 8,
      onlineUsers: 24,
      messagesSent: 847,
      messagesReceived: 400,
    };

    return of(mockStats).pipe(delay(500));
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    const mockActivity: RecentActivity[] = [
      {
        id: 1,
        type: 'message',
        description: 'vous a envoyé un message',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'Alice Martin',
      },
      {
        id: 2,
        type: 'user_joined',
        description: "s'est connecté(e)",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'Bob Dupont',
      },
      {
        id: 3,
        type: 'message',
        description: 'vous a envoyé un message',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'Charlie Bernard',
      },
      {
        id: 4,
        type: 'user_left',
        description: "s'est déconnecté(e)",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'Diana Chen',
      },
    ];

    return of(mockActivity).pipe(delay(300));
  }

  getQuickActions(): QuickAction[] {
    return [
      {
        title: 'Nouveau message',
        description: 'Commencer une conversation',
        icon: 'chat',
        route: '/messages',
        color: 'blue',
        badge: 3,
      },
      {
        title: 'Utilisateurs en ligne',
        description: 'Voir qui est disponible',
        icon: 'users',
        route: '/users',
        color: 'green',
      },
      {
        title: 'Mon profil',
        description: 'Gérer votre compte',
        icon: 'user',
        route: '/profile',
        color: 'purple',
      },
      {
        title: 'Paramètres',
        description: "Configuration de l'app",
        icon: 'settings',
        route: '/settings',
        color: 'gray',
      },
    ];
  }
}
