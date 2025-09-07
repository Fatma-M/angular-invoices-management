import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as Node | null;
    if (!target) return;
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
