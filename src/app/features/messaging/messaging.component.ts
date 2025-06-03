import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ConversationsListComponent } from './components/conversations-list.component';
import { ChatWindowComponent } from './components/chat-window.component';
import { UserInfoPanelComponent } from './components/user-info-panel.component';
import { NewConversationModalComponent } from './components/new-conversation-modal.component';
import { MessagingService } from '../../core/services/messaging.service';
import { UsersService } from '../../core/services/users.service';
import { Conversation } from '../../core/models/messaging.models';
import { PipesModule } from '../../shared/pipes/pipes.module';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule,
    ConversationsListComponent,
    ChatWindowComponent,
    UserInfoPanelComponent,
    NewConversationModalComponent,
    PipesModule,
  ],
  template: `
    <div class="h-full flex bg-gray-50">
      <!-- Desktop: 3 colonnes -->
      <div class="hidden lg:flex w-full h-full" *ngIf="!isMobile()">
        <!-- Liste des conversations -->
        <div class="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <app-conversations-list
            (newConversation)="startNewConversation()"
          ></app-conversations-list>
        </div>

        <!-- Zone de chat principale -->
        <div class="flex-1 flex flex-col min-w-0">
          <app-chat-window
            *ngIf="activeConversation(); else noConversationSelected"
          ></app-chat-window>

          <ng-template #noConversationSelected>
            <div class="flex-1 flex items-center justify-center bg-gray-50">
              <div class="text-center">
                <div
                  class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <svg
                    class="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h3 class="text-xl font-medium text-gray-900 mb-2">
                  SecureTalk
                </h3>
                <p class="text-gray-500 mb-4">
                  Sélectionnez une conversation pour commencer à discuter
                </p>
                <button class="btn-primary" (click)="startNewConversation()">
                  Nouvelle conversation
                </button>
              </div>
            </div>
          </ng-template>
        </div>

        <!-- Panel d'informations utilisateur -->
        <div
          class="w-80 bg-white border-l border-gray-200 flex-shrink-0 transition-all duration-300"
          [class.hidden]="!showUserPanel()"
          *ngIf="activeConversation()"
        >
          <app-user-info-panel></app-user-info-panel>
        </div>
      </div>

      <!-- Mobile: Vue empilée -->
      <div class="lg:hidden w-full h-full" *ngIf="isMobile()">
        <!-- Liste des conversations -->
        <div *ngIf="mobileView() === 'conversations'" class="h-full">
          <app-conversations-list
            (conversationSelected)="onMobileConversationSelected($event)"
            (newConversation)="startNewConversation()"
          >
          </app-conversations-list>
        </div>

        <!-- Chat actif -->
        <div *ngIf="mobileView() === 'chat'" class="h-full">
          <app-chat-window
            [showBackButton]="true"
            (backClicked)="onMobileBackToConversations()"
          >
          </app-chat-window>
        </div>
      </div>
    </div>
    
    <!-- Modal de nouvelle conversation -->
    <app-new-conversation-modal
      [isOpen]="showNewConversationModal()"
      (close)="closeNewConversationModal()"
    ></app-new-conversation-modal>
  `,
})
export class MessagingComponent implements OnInit {
  private readonly messagingService = inject(MessagingService);
  private readonly usersService = inject(UsersService);

  // Signals pour l'état de l'interface
  readonly isMobile = signal(false); // TODO: Add BreakpointObserver
  readonly mobileView = signal<'conversations' | 'chat'>('conversations');
  readonly showUserPanel = signal(true);
  readonly showNewConversationModal = signal(false);

  // Data from service
  readonly activeConversation = this.messagingService.activeConversation;
  readonly conversations = this.messagingService.conversations;
  readonly loading = this.messagingService.loading;

  ngOnInit() {
    // Détecter si mobile (simplified for now)
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
    
    // Charger les conversations et sélectionner la première
    this.messagingService.loadConversations().subscribe(conversations => {
      if (conversations.length > 0 && !this.activeConversation()) {
        this.messagingService.selectConversation(conversations[0]);
      }
    });
  }

  private checkMobileView() {
    this.isMobile.set(window.innerWidth < 1024);
  }

  onMobileConversationSelected(conversation: any) {
    this.mobileView.set('chat');
  }

  onMobileBackToConversations() {
    this.mobileView.set('conversations');
  }

  startNewConversation() {
    // Charger la liste des utilisateurs avant d'ouvrir le modal
    this.usersService.loadUsers().subscribe(() => {
      // Ouvrir le modal de nouvelle conversation
      this.showNewConversationModal.set(true);
    });
  }
  
  closeNewConversationModal() {
    this.showNewConversationModal.set(false);
  }

  toggleUserPanel() {
    this.showUserPanel.update((show) => !show);
  }
}
