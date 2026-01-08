import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ContentChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-side-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sheet.component.html',
})
export class SideSheetComponent {
  @Input() width = '420px';
  @Input() position: 'right' | 'left' = 'right';
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  @ContentChild('[slot=footer]') footer?: ElementRef;

  get sideSheetStyles() {
    return {
      width: '100%',
      maxWidth: this.width,
      transform: this.open
        ? 'translateX(0)'
        : this.position === 'right'
        ? 'translateX(100%)'
        : 'translateX(-100%)',
      right: this.position === 'right' ? '0' : null,
      left: this.position === 'left' ? '0' : null,
    };
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) this.close();
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }
}
