import {
  Component,
  inject,
  signal,
  input,
  output,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoResizeDirective } from '../../../shared/directives/auto-resize.directive';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoResizeDirective],
  template: `
    <div class="p-4 bg-white">
      <div class="flex items-end space-x-3">
        <!-- Bouton d'attachement -->
        <button
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          [disabled]="disabled()"
          title="Joindre un fichier"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            ></path>
          </svg>
        </button>

        <!-- Zone de texte principale -->
        <div class="flex-1 relative">
          <!-- Textarea avec auto-resize -->
          <textarea
            #messageTextarea
            [(ngModel)]="messageContent"
            (ngModelChange)="onInputChange()"
            (keydown)="onKeyDown($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            appAutoResize
            [disabled]="disabled()"
            class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors placeholder-gray-400"
            [class.border-red-300]="hasError()"
            [class.bg-gray-50]="disabled()"
            placeholder="Tapez votre message..."
            rows="1"
            maxlength="1000"
          ></textarea>

          <!-- Compteur de caractères -->
          <div
            *ngIf="showCharacterCount()"
            class="absolute bottom-1 right-1 text-xs"
            [class.text-gray-400]="messageContent().length < 900"
            [class.text-yellow-600]="
              messageContent().length >= 900 && messageContent().length < 980
            "
            [class.text-red-600]="messageContent().length >= 980"
          >
            {{ messageContent().length }}/1000
          </div>

          <!-- Bouton emoji -->
          <button
            class="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            [disabled]="disabled()"
            (click)="toggleEmojiPicker()"
            title="Emojis"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </button>

          <!-- Picker d'emoji simple -->
          <div
            *ngIf="showEmojiPicker()"
            class="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
          >
            <div class="grid grid-cols-8 gap-1">
              <button
                *ngFor="let emoji of commonEmojis"
                (click)="insertEmoji(emoji)"
                class="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- Bouton d'envoi -->
        <button
          (click)="sendMessage()"
          [disabled]="!canSend() || disabled()"
          class="p-3 rounded-full transition-all duration-200 flex-shrink-0"
          [class.bg-primary-500]="canSend() && !disabled()"
          [class.hover:bg-primary-600]="canSend() && !disabled()"
          [class.text-white]="canSend() && !disabled()"
          [class.bg-gray-200]="!canSend() || disabled()"
          [class.text-gray-400]="!canSend() || disabled()"
          [class.cursor-not-allowed]="!canSend() || disabled()"
          title="Envoyer le message (Ctrl+Entrée)"
        >
          <svg
            *ngIf="!sending()"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>

          <!-- Loading spinner -->
          <div *ngIf="sending()" class="animate-spin w-5 h-5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage()" class="mt-2 text-sm text-red-600">
        {{ errorMessage() }}
      </div>

      <!-- Raccourcis clavier -->
      <div *ngIf="showShortcuts()" class="mt-2 text-xs text-gray-500">
        <span class="inline-flex items-center space-x-1">
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Entrée</kbd>
          <span>pour envoyer</span>
        </span>
        <span class="ml-4 inline-flex items-center space-x-1">
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Maj</kbd>
          <span>+</span>
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Entrée</kbd>
          <span>pour nouvelle ligne</span>
        </span>
      </div>
    </div>
  `,
})
export class MessageInputComponent implements OnInit, OnDestroy {
  @ViewChild('messageTextarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  // Inputs et outputs
  disabled = input(false);
  messageSent = output<string>();
  typing = output<void>();
  stopTyping = output<void>();

  // État local
  messageContent = signal('');
  sending = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  showEmojiPicker = signal(false);
  showShortcuts = signal(false);

  // Timers pour la gestion de la frappe
  private typingTimer: any = null;
  private isTyping = false;

  // Emojis couramment utilisés
  readonly commonEmojis = [
    '😀',
    '😂',
    '😍',
    '🤔',
    '😢',
    '😡',
    '👍',
    '👎',
    '❤️',
    '💔',
    '🎉',
    '🎊',
    '🔥',
    '💯',
    '✨',
    '⭐',
    '👋',
    '🙏',
    '💪',
    '👏',
    '🤝',
    '💕',
    '😎',
    '🤗',
  ];

  readonly canSend = computed(() => {
    const content = this.messageContent().trim();
    return content.length > 0 && content.length <= 1000 && !this.sending();
  });

  readonly showCharacterCount = computed(() => {
    return this.messageContent().length > 800;
  });

  ngOnInit() {
    // Afficher les raccourcis au premier focus
    setTimeout(() => {
      this.showShortcuts.set(true);
      setTimeout(() => this.showShortcuts.set(false), 5000);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    if (this.isTyping) {
      this.stopTyping.emit();
    }
  }

  onInputChange() {
    // Gérer l'indicateur de frappe
    if (!this.isTyping && this.messageContent().trim()) {
      this.isTyping = true;
      this.typing.emit();
    }

    // Reset du timer de frappe
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      if (this.isTyping) {
        this.isTyping = false;
        this.stopTyping.emit();
      }
    }, 2000);

    // Validation
    this.validateMessage();
  }

  onKeyDown(event: KeyboardEvent) {
    // Ctrl + Entrée pour envoyer
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
      return;
    }

    // Maj + Entrée pour nouvelle ligne (comportement par défaut)
    if (event.shiftKey && event.key === 'Enter') {
      return;
    }

    // Entrée seule pour envoyer (optionnel)
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      this.sendMessage();
      return;
    }

    // Échapper pour fermer l'emoji picker
    if (event.key === 'Escape') {
      this.showEmojiPicker.set(false);
    }
  }

  onFocus() {
    this.hasError.set(false);
    this.errorMessage.set('');
  }

  onBlur() {
    // Arrêter l'indicateur de frappe après un délai
    setTimeout(() => {
      if (this.isTyping) {
        this.isTyping = false;
        this.stopTyping.emit();
      }
    }, 1000);
  }

  sendMessage() {
    if (!this.canSend()) return;

    const content = this.messageContent().trim();
    if (!content) return;

    this.sending.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    // Simuler l'envoi avec un délai
    setTimeout(() => {
      try {
        this.messageSent.emit(content);
        this.messageContent.set('');
        this.sending.set(false);

        // Arrêter l'indicateur de frappe
        if (this.isTyping) {
          this.isTyping = false;
          this.stopTyping.emit();
        }

        // Focus sur l'input après envoi
        this.focusTextarea();
      } catch (error) {
        this.sending.set(false);
        this.hasError.set(true);
        this.errorMessage.set("Erreur lors de l'envoi du message");
      }
    }, 300);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker.update((show) => !show);
  }

  insertEmoji(emoji: string) {
    const currentContent = this.messageContent();
    const textarea = this.textareaRef.nativeElement;
    const cursorPosition = textarea.selectionStart;

    const newContent =
      currentContent.slice(0, cursorPosition) +
      emoji +
      currentContent.slice(cursorPosition);

    this.messageContent.set(newContent);
    this.showEmojiPicker.set(false);

    // Repositionner le curseur après l'emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        cursorPosition + emoji.length,
        cursorPosition + emoji.length,
      );
    });

    this.onInputChange();
  }

  private validateMessage() {
    const content = this.messageContent();

    if (content.length > 1000) {
      this.hasError.set(true);
      this.errorMessage.set('Le message ne peut pas dépasser 1000 caractères');
    } else {
      this.hasError.set(false);
      this.errorMessage.set('');
    }
  }

  private focusTextarea() {
    setTimeout(() => {
      this.textareaRef?.nativeElement?.focus();
    }, 100);
  }
}
