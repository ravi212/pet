import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClasses()" class="inline-flex items-center rounded-md font-medium">
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'md';

  getBadgeClasses(): string {
    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    const variantClasses: Record<BadgeVariant, string> = {
      primary: 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark',
      secondary: 'bg-secondary/10 text-secondary dark:bg-secondary-dark/10 dark:text-secondary-dark',
      success: 'bg-success/10 text-success dark:bg-success-dark/10 dark:text-success-dark',
      danger: 'bg-danger/10 text-danger dark:bg-danger-dark/10 dark:text-danger-dark',
      warning: 'bg-warning/10 text-warning dark:bg-warning-dark/10 dark:text-warning-dark',
      info: 'bg-info/10 text-info dark:bg-info-dark/10 dark:text-info-dark',
    };

    return `${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }
}
