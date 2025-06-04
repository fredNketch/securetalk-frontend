import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_status' | 'notification';
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private stompSubscription: StompSubscription | null = null;
  private readonly connectionStatus = signal<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');
  private readonly messageSubject = new Subject<WebSocketMessage>();
  private readonly connectionSubject = new BehaviorSubject<boolean>(false);

  readonly messages$ = this.messageSubject.asObservable();
  readonly isConnected = this.connectionStatus.asReadonly();
  readonly connectionState$ = this.connectionSubject.asObservable();

  connect(token: string): Observable<boolean> {
    return new Observable((observer) => {
      if (this.stompClient && this.stompClient.connected) {
        observer.next(true);
        observer.complete();
        return;
      }

      this.connectionStatus.set('connecting');
      const wsUrl = `https://localhost:8443/ws`;
      
      this.stompClient = new Client({
        brokerURL: undefined, // force SockJS
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (msg) => console.debug('[STOMP]', msg),
        reconnectDelay: 5000,
        onConnect: () => this.handleConnect(observer),
        onStompError: (frame) => this.handleError(observer, frame),
        onWebSocketClose: () => this.handleClose()
      });

      this.stompClient.activate();
    });
  }

  private handleConnect(observer: any): void {
    this.connectionStatus.set('connected');
    this.connectionSubject.next(true);
    
    // S'abonner au topic messages pour l'utilisateur
    this.stompSubscription = this.stompClient!.subscribe(
      '/user/queue/messages',
      (msg: IMessage) => this.handleIncomingMessage(msg)
    );

    // S'abonner aux mises à jour de conversation
    this.stompSubscription = this.stompClient!.subscribe(
      '/user/queue/conversations',
      (msg: IMessage) => this.handleConversationUpdate(msg)
    );

    observer.next(true);
    observer.complete();
  }

  private handleIncomingMessage(msg: IMessage): void {
    try {
      const data = JSON.parse(msg.body);
      const message: WebSocketMessage = {
        type: 'message',
        data: data,
        timestamp: new Date(data.timestamp || Date.now()),
      };
      this.messageSubject.next(message);
    } catch (err) {
      console.error('Erreur parsing STOMP message:', err);
    }
  }

  private handleConversationUpdate(msg: IMessage): void {
    try {
      const data = JSON.parse(msg.body);
      const message: WebSocketMessage = {
        type: 'notification',
        data: data,
        timestamp: new Date()
      };
      this.messageSubject.next(message);
    } catch (err) {
      console.error('Erreur parsing conversation update:', err);
    }
  }

  private handleError(observer: any, frame: any): void {
    console.error('Erreur de connexion WebSocket:', frame);
    this.connectionStatus.set('disconnected');
    this.connectionSubject.next(false);
    observer.error(frame);
  }

  private handleClose(): void {
    this.connectionStatus.set('disconnected');
    this.connectionSubject.next(false);
  }

  disconnect(): void {
    if (this.stompSubscription) {
      this.stompSubscription.unsubscribe();
      this.stompSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connectionStatus.set('disconnected');
    this.connectionSubject.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messageSubject.complete();
    this.connectionSubject.complete();
  }

  sendMessage(type: string, data: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/send',
        body: JSON.stringify({
          type,
          payload: data,
          timestamp: new Date().toISOString(),
        }),
      });
    } else {
      console.warn('STOMP is not connected. Cannot send message.');
    }
  }

  // Méthode pour le ping (exemple d'utilisation avec un interval)
  startPing(): void {
    setInterval(() => {
      if (this.stompClient?.connected) {
        this.sendMessage('ping', {});
      }
    }, 30000); // ping toutes les 30 secondes
  }
}
