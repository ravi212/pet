import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  @Input() position: 'inline' | 'center' | 'top' | 'bottom' | 'fullscreen' = 'inline';

  /** spinner | skeleton */
  @Input() type: 'spinner' | 'skeleton' = 'spinner';

  /** Small | medium | large */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Optional loading text */
  @Input() text?: string;

  /** Skeleton rows count */
  @Input() rows = 3;

  get spinnerSizeClass() {
    return {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-10 w-10 border-4',
    }[this.size];
  }

  get containerClass() {
    return {
      inline: 'flex items-center gap-3',
      center: 'absolute inset-0 flex items-center justify-center',
      top: 'absolute top-4 left-1/2 -translate-x-1/2 flex items-center',
      bottom: 'absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center',
      fullscreen:
        'fixed inset-0 z-50 flex items-center justify-center gap-3 ' +
        'bg-white/70 dark:bg-gray-950/70',
    }[this.position];
  }
}
