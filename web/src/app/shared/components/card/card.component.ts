import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  template: `
    <div
      [class]="getCardClasses()"
      class="rounded-md transition-all duration-base"
    >
      @if (title) {
        <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-50">{{ title }}</h3>
        </div>
      }
      <div [class]="padding">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() title: string | null = null;
  @Input() padding = 'p-6';
  @Input() elevated = true;
  @Input() hover = false;

  getCardClasses(): string {
    const baseClasses = 'bg-white dark:bg-gray-800';
    const shadowClass = this.elevated ? 'shadow-md' : 'border border-gray-200 dark:border-gray-700';
    const hoverClass = this.hover ? 'hover:shadow-lg cursor-pointer transition-shadow' : '';

    return `${baseClasses} ${shadowClass} ${hoverClass}`.trim();
  }
}
