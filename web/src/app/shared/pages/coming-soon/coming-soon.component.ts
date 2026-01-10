import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '../../components';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [LucideAngularModule, CardComponent, CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-[60vh] px-4">
      <app-card class="max-w-md w-full text-center" [elevated]="true">
        <div class="flex flex-col items-center gap-4 py-8">
          <span
            class="flex items-center justify-center w-16 h-16 rounded-full
                   bg-blue-100 text-blue-600"
            [ngClass]="variantConfig.iconBg"
          >
            <lucide-angular [img]="icon" size="28"></lucide-angular>
          </span>

          <h2
            [ngClass]="variantConfig.title"
            class="text-xl font-semibold text-gray-600 dark:text-gray-50"
          >
            {{ title }}
          </h2>

          <p [ngClass]="variantConfig.description" class="text-sm text-gray-600 dark:text-gray-400">
            {{ description }}
          </p>

          @if (ctaText) {
          <button
            type="button"
            class="mt-4 text-sm font-medium text-blue-600 hover:underline"
            (click)="ctaClick?.()"
          >
            {{ ctaText }}
          </button>
          }
        </div>
      </app-card>
    </div>
  `,
})
export class ComingSoonComponent {
  @Input() title = 'Coming Soon';
  @Input() description = 'This feature is currently under construction.';
  @Input() icon: any;
  @Input() ctaText?: string;
  @Input() ctaClick?: () => void;
  @Input() variant: 'info' | 'warning' = 'info';
  get variantConfig() {
    const variants = {
      info: {
        iconBg: 'bg-blue-100 text-blue-600',
        title: 'text-gray-600 dark:text-gray-50',
        description: 'text-gray-600 dark:text-gray-400',
      },
      warning: {
        iconBg: 'bg-yellow-100 text-yellow-600',
        title: 'text-yellow-800 dark:text-yellow-400',
        description: 'text-yellow-700 dark:text-yellow-500',
      },
    };

    return variants[this.variant];
  }

  ngOnInit() {
    if (this.variant === 'warning') {
      this.title ||= 'Under Construction';
      this.description ||= 'This feature is not ready yet. Check back soon.';
    }
  }
}
