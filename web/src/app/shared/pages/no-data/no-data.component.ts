import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconNode } from 'lucide-angular';
import { ButtonComponent } from '../../components';

@Component({
  selector: 'app-no-data',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div
      class="flex flex-col items-center justify-center text-center
             rounded-xl border border-dashed border-gray-300
             bg-gradient-to-br from-gray-50 to-white
             p-8 md:p-12 max-w-md mx-auto"
    >
      <!-- Icon -->
      <div
        *ngIf="icon"
        class="mb-4 flex items-center justify-center
               w-14 h-14 rounded-full
               bg-primary/10 text-primary"
      >
        <lucide-angular [img]="icon" size="26" />
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="mt-1 text-sm text-gray-500 leading-relaxed">
        {{ description }}
      </p>

      <!-- Action -->
      <app-button
        *ngIf="actionLabel"
        (click)="action.emit()"
        variant="secondary"
        class="mt-6"
      >
        {{ actionLabel }}
      </app-button>
    </div>
  `,
})
export class NoDataComponent {
  @Input() title = 'No data found';
  @Input() description = 'There is no information to display at the moment.';
  @Input() icon?: LucideIconNode[];
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
