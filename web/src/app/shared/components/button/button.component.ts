import { Component, Input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      class="inline-flex items-center justify-center font-medium transition-all duration-base focus-ring"
    >
      @if (loading) {
      <span
        class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      ></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  getButtonClasses(): string {
    const baseClasses = [
      (this.disabled || this.loading) && 'disabled-state',
      'font-medium',
      'rounded-sm',
      'transition-all',
      'duration-base',
    ]
      .filter(Boolean)
      .join(' ');

    // Size classes
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Variant classes
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-white hover:opacity-90 dark:bg-primary-dark',
      secondary: 'bg-secondary text-white hover:opacity-90 dark:bg-secondary-dark',
      accent: 'bg-accent text-white hover:opacity-90 dark:bg-accent-dark',
      danger: 'bg-danger text-white hover:opacity-90 dark:bg-danger-dark',
      outline:
        'w-full border border-gray-300 font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-primary-dark dark:text-primary-dark',
      ghost: 'text-primary hover:bg-gray-100 dark:text-primary-dark dark:hover:bg-gray-800',
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${
      variantClasses[this.variant]
    } ${widthClass}`.trim();
  }
}
