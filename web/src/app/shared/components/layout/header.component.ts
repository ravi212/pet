import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [LucideAngularModule, CommonModule],
  template: `
    <header
      class="h-16 flex items-center justify-between px-6
             bg-white border-b border-gray-200 shadow-sm"
    >
      <!-- LEFT -->
      <div class="flex items-center gap-4">
        @if (backButton){
        <lucide-angular
          [img]="arrowLeftIcon"
          size="18"
          class="cursor-pointer text-gray-500 hover:text-gray-900 transition"
          (click)="goBack()"
        />
        }

        <div>
          <h1 class="text-sm font-semibold leading-tight">
            {{ title }}
          </h1>
          <p class="text-xs text-gray-500">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <ng-content />
    </header>
  `,
})
export class AppHeaderComponent {
  router = inject(Router);

  goBack() {
    this.router.navigate(['..']);
  }

  @Input() title = '';
  @Input() subtitle = '';
  @Input() backButton = true;

  readonly arrowLeftIcon = ArrowLeft;
}
