import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from "../button/button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity duration-base"
          (click)="closeModal()"
        ></div>

        <!-- Modal -->
        <div class="flex w-full justify-center p-4">
          <div
            class="relative transform rounded-md bg-white shadow-xl transition-all duration-base dark:bg-gray-800"
            [ngStyle]="{'width': width}"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-50">{{ title }}</h3>
              <button
                (click)="closeModal()"
                class="text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <app-button
                  (click)="closeModal()"
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </app-button>
                <app-button
                  (click)="confirm()"
                  size="sm"
                  variant="secondary"
                >
                  {{confirmButtonTitle}}
                </app-button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title: string | null = 'Modal Title';
  @Input() showFooter = true;
  @Input() confirmButtonTitle = 'Confirm';

  // NEW: modal width input with default
  @Input() width = '500px';

  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  confirm(): void {
    this.confirmed.emit();
    this.closeModal();
  }
}
