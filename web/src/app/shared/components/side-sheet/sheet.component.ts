import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-side-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sheet.component.html',
})
export class SideSheetComponent {
  @Input() width = '400px';
  @Input() position: 'right' | 'left' = 'right';
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  get sideSheetStyles() {
  return {
    width: this.width,
    transform: this.open
      ? 'translateX(0)'
      : this.position === 'right'
      ? 'translateX(100%)'
      : 'translateX(-100%)',
    left: this.position === 'left' ? '0' : null,
    right: this.position === 'right' ? '0' : null,
  };
}

  close() {
    this.open = false;
    this.openChange.emit(false);
  }
}
