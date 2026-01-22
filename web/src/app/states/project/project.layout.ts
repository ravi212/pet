import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  template: `
    <app-header [backButton]="false" title="PET" subtitle="Project Expense Tracker">
    </app-header>
    <div class="w-full max-w-7xl mx-auto p-6 sm:px-10 sm:py-8 py-4">
      <router-outlet />
    </div>
  `,
})
export class ProjectLayoutComponent {}
