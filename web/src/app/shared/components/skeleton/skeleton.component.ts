import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [style.width]="width"
      [style.height]="height"
      class="animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
    ></div>
  `,
  styles: []
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
}
