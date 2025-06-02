import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [NgClass],
  template: `
    <div 
      class="rounded-full" 
      [ngClass]="{
        'w-2 h-2': size === 'sm',
        'w-3 h-3': size === 'md' || !size,
        'w-4 h-4': size === 'lg',
        'bg-green-500': status === 'online',
        'bg-yellow-500': status === 'away',
        'bg-red-500': status === 'busy',
        'bg-gray-400': status === 'offline' || !status
      }">
    </div>
  `,
  styles: []
})
export class StatusIndicatorComponent {
  @Input() status: 'online' | 'away' | 'busy' | 'offline' = 'offline';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
