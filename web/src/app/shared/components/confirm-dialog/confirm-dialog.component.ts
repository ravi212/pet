import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      *ngIf="open"
    >
      <div
        class="bg-white dark:bg-dark-900 rounded-md shadow-xl max-w-sm w-full p-6 flex flex-col gap-4 transition-all"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>

        <div class="flex justify-end gap-3 mt-4">
          <app-button
            type="button"
            variant="outline"
            (click)="cancel.emit()"
          >
            Cancel
          </app-button>

          <app-button
            type="button"
            variant="danger"
            (click)="confirm.emit()"
          >
            Confirm
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
