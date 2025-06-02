import { Injectable, signal } from '@angular/core';
import { Observable, Subject, timer, takeUntil } from 'rxjs';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_status' | 'notification';
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly connectionStatus = signal<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');
  private readonly messageSubject = new Subject<WebSocketMessage>();
  private readonly destroy$ = new Subject<void>();

  // Public observables
  readonly messages$ = this.messageSubject.asObservable();
  readonly isConnected = this.connectionStatus.asReadonly();

  connect(token: string): Observable<boolean> {
    return new Observable((observer) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        observer.next(true);
        observer.complete();
        return;
      }

      this.connectionStatus.set('connecting');

      // TODO: Use environment URL
      const wsUrl = `ws://localhost:8080/ws?token=${token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus.set('connected');
        observer.next(true);
        observer.complete();

        // Start heartbeat
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: WebSocketMessage = {
            type: data.type,
            data: data.payload,
            timestamp: new Date(data.timestamp || Date.now()),
          };
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.set('disconnected');
        observer.error(error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionStatus.set('disconnected');
        // Auto-reconnect logic could be added here
      };
    });
  }

  disconnect(): void {
    this.destroy$.next();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connectionStatus.set('disconnected');
  }

  sendMessage(type: string, data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload: data,
        timestamp: new Date().toISOString(),
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  private startHeartbeat(): void {
    timer(0, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.sendMessage('ping', {});
        }
      });
  }
}
