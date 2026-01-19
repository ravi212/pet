import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [LucideAngularModule, RouterModule, CommonModule],
  template: `
    <aside
      class="relative h-full bg-white border-r border-gray-200
             transition-all duration-base ease-out flex flex-col"
      [class.w-60]="!collapsed"
      [class.w-[72px]]="collapsed"
    >
      <!-- Toggle handle on the edge -->
      <button
        class="absolute -right-3 top-5 w-6 h-6 bg-white border border-gray-300
               rounded-full shadow md:flex hidden items-center justify-center
               hover:bg-gray-100 transition"
        (click)="toggle.emit()"
      >
        <lucide-angular
          [img]="arrowLeftIcon"
          size="16"
          class="transition-transform duration-base"
          [class.rotate-180]="collapsed"
        />
      </button>

      <!-- Nav links -->
      <nav class="p-4 flex-1 flex flex-col gap-1">
        <a
          *ngFor="let item of items"
          [routerLink]="item.link"
          routerLinkActive="bg-primary/10 text-primary"
          class="flex items-center gap-3 px-2.5 py-2 rounded-sm
           text-sm font-medium text-gray-600
           hover:bg-gray-100 transition"
        >
          <lucide-angular [name]="item.icon" size="18" />

          <span
            class="transition-opacity duration-fast whitespace-nowrap"
            [class.opacity-0]="collapsed"
            [class.pointer-events-none]="collapsed"
          >
            {{ item.label }}
          </span>
        </a>
      </nav>
    </aside>
  `,
})
export class AppSidebarComponent {
  @Input() collapsed = true;
  readonly arrowLeftIcon = ArrowLeft;
  @Output() toggle = new EventEmitter<void>();
  @Input() items: {
    label: string;
    link: string;
    icon: any;
  }[] = [];
}
