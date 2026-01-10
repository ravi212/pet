import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { AUTH_ROUTES } from '../../shared/constants/routes.const';
import { SharedModule } from '../../shared/shared.module';

@Component({
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  template: `
    <app-header [backButton]="false" title="PET" subtitle="Project Expense Tracker" >
      <!-- Avatar + Dropdown -->
      <div class="relative group">
        <!-- Avatar trigger -->
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
               text-white flex items-center justify-center text-sm font-semibold
               cursor-pointer select-none"
        >
          {{ initials }}
        </div>

        <!-- Dropdown -->
        <div
          class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl border
               opacity-0 invisible translate-y-2
               group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
               transition-all duration-200 ease-out z-50"
        >
          <!-- User info -->
          <div class="px-4 py-3 border-b">
            <p class="text-sm font-semibold text-gray-900">
              {{ user()?.displayName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user()?.email }}
            </p>
          </div>

          <!-- Actions -->
          <div class="py-2">
            <button
              class="w-full px-4 py-2 text-left text-sm text-gray-700
                   hover:bg-gray-100 transition"
            >
              Profile
            </button>

            <button
              class="w-full px-4 py-2 text-left text-sm text-red-600
                   hover:bg-red-50 transition"
              (click)="logOut()"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </app-header>
    <div class="w-full max-w-7xl mx-auto px-10 py-8">
      <router-outlet />
    </div>
  `,
})
export class ProjectLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = signal(this.auth.userDetails());

  get initials(): string {
    const name = this.user()?.displayName?.trim();
    if (!name) return '';

    const parts = name.split(/\s+/);

    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';

    return (first + second).toUpperCase();
  }

  logOut() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate([`/${AUTH_ROUTES.ROOT}/${AUTH_ROUTES.LOGIN}`]);
      },
      error: (error) => {
        console.error('Logout failed:', error);
      },
    });
  }
}
