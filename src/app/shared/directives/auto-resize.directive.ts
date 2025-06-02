import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoResize]',
  standalone: true,
})
export class AutoResizeDirective implements OnInit {
  private readonly maxHeight = 120; // 5 lignes environ
  private readonly minHeight = 40; // 1 ligne

  constructor(private elementRef: ElementRef<HTMLTextAreaElement>) {}

  ngOnInit() {
    this.resize();
  }

  @HostListener('input')
  onInput() {
    this.resize();
  }

  private resize() {
    const textarea = this.elementRef.nativeElement;

    // Reset height to calculate scrollHeight correctly
    textarea.style.height = 'auto';

    // Calculate new height
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, this.minHeight),
      this.maxHeight,
    );

    // Apply new height
    textarea.style.height = `${newHeight}px`;

    // Add scrollbar if content exceeds maxHeight
    textarea.style.overflowY =
      textarea.scrollHeight > this.maxHeight ? 'auto' : 'hidden';
  }
}
