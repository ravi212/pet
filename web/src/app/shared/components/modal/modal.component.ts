import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity duration-base"
          (click)="closeModal()"
        ></div>

        <!-- Modal -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all duration-base dark:bg-gray-800"
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
                <button
                  (click)="closeModal()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  (click)="confirm()"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-md transition-all dark:bg-primary-dark"
                >
                  Confirm
                </button>
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
  @Input() title = 'Modal Title';
  @Input() showFooter = true;

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
