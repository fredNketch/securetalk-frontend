import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalMessages: number;
  messagesLastWeek: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  serverLoad: number;
  storageUsed: number;
}

export interface SystemAlert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface UserActivity {
  id: number;
  username: string;
  email: string;
  lastLogin: Date;
  messagesCount: number;
  status: 'online' | 'offline' | 'banned';
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  getAdminStats(): Observable<AdminStats> {
    const mockStats: AdminStats = {
      totalUsers: 1547,
      activeUsers: 892,
      bannedUsers: 23,
      totalMessages: 45678,
      messagesLastWeek: 3421,
      systemHealth: 'excellent',
      serverLoad: 78,
      storageUsed: 45,
    };

    return of(mockStats).pipe(delay(800));
  }

  getSystemAlerts(): Observable<SystemAlert[]> {
    const mockAlerts: SystemAlert[] = [
      {
        id: 1,
        type: 'warning',
        title: 'Stockage élevé',
        message: "L'espace de stockage atteint 85% de la capacité",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        resolved: false,
      },
      {
        id: 2,
        type: 'info',
        title: 'Mise à jour disponible',
        message: 'Une nouvelle version de SecureTalk est disponible',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false,
      },
      {
        id: 3,
        type: 'success',
        title: 'Sauvegarde terminée',
        message: 'Sauvegarde automatique effectuée avec succès',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true,
      },
    ];

    return of(mockAlerts).pipe(delay(400));
  }

  getRecentUsers(): Observable<UserActivity[]> {
    const mockUsers: UserActivity[] = [
      {
        id: 1,
        username: 'alice_martin',
        email: 'alice.martin@example.com',
        lastLogin: new Date(Date.now() - 10 * 60 * 1000),
        messagesCount: 156,
        status: 'online',
      },
      {
        id: 2,
        username: 'bob_dupont',
        email: 'bob.dupont@example.com',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        messagesCount: 89,
        status: 'offline',
      },
      {
        id: 3,
        username: 'charlie_bernard',
        email: 'charlie.bernard@example.com',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        messagesCount: 234,
        status: 'online',
      },
    ];

    return of(mockUsers).pipe(delay(600));
  }
}
