import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { SharedModule } from '../../shared/shared.module';

@Component({
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, SharedModule],
  template: `
    <div class="h-screen flex flex-col">
      <app-header title="PET" subtitle="Project Expense Tracker"></app-header>
      <div class="max-w-7xl mx-auto w-full px-6 sm:px-10 sm:py-8 py-4">
        <router-outlet />
      </div>
    </div>
  `,
})
export class SettingsLayoutComponent {
  readonly backIcon = ArrowLeft;
}
